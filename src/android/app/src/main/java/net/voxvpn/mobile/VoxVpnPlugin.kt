package net.voxvpn.mobile

import android.app.Activity
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.VpnService
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import de.blinkt.openvpn.VpnProfile
import de.blinkt.openvpn.core.ConfigParser
import de.blinkt.openvpn.core.OpenVPNService
import de.blinkt.openvpn.core.ProfileManager
import de.blinkt.openvpn.core.VpnStatus
import de.blinkt.openvpn.core.VpnStatus.StateListener
import java.io.InputStreamReader

/**
 * VoxVpnPlugin — Capacitor bridge between the React UI and ICS-OpenVPN.
 *
 * JS usage (from React):
 *   import { Plugins } from '@capacitor/core';
 *   const { VoxVpnPlugin } = Plugins;
 *   await VoxVpnPlugin.connect({ config: 'us-ny' });
 *   await VoxVpnPlugin.disconnect();
 *   const status = await VoxVpnPlugin.getStatus();
 */
@CapacitorPlugin(name = "VoxVpnPlugin")
class VoxVpnPlugin : Plugin(), StateListener {

    companion object {
        private const val VPN_REQUEST_CODE = 24601
        private const val CONFIG_DIR = "configs"
    }

    private var pendingConnectCall: PluginCall? = null
    private var currentConfigName: String? = null

    // ── Lifecycle ────────────────────────────────────────────────────────────

    override fun load() {
        VpnStatus.addStateListener(this)
    }

    override fun handleOnDestroy() {
        VpnStatus.removeStateListener(this)
        super.handleOnDestroy()
    }

    // ── VpnStatus.StateListener ──────────────────────────────────────────────

    override fun updateState(
        state: String?,
        logmessage: String?,
        localizedResId: Int,
        level: VpnStatus.ConnectionStatus?,
        intent: Intent?
    ) {
        val isConnected = level == VpnStatus.ConnectionStatus.LEVEL_CONNECTED
        val isConnecting = level == VpnStatus.ConnectionStatus.LEVEL_CONNECTING_NO_SERVER_REPLY_YET ||
                level == VpnStatus.ConnectionStatus.LEVEL_CONNECTING_SERVER_REPLIED
        val isDisconnected = level == VpnStatus.ConnectionStatus.LEVEL_NOTCONNECTED ||
                level == VpnStatus.ConnectionStatus.LEVEL_AUTH_FAILED

        val statusObj = JSObject().apply {
            put("state", state ?: "DISCONNECTED")
            put("connected", isConnected)
            put("connecting", isConnecting)
            put("level", level?.name ?: "NOTCONNECTED")
            put("message", logmessage ?: "")
        }

        // Notify JS listeners
        notifyListeners("vpnStatus", statusObj)

        // Resolve pending connect call once connected/failed
        pendingConnectCall?.let { call ->
            when {
                isConnected -> {
                    call.resolve(statusObj)
                    pendingConnectCall = null
                }
                isDisconnected && state != "CONNECTED" -> {
                    // Only reject if we were actually connecting
                    pendingConnectCall = null
                }
            }
        }
    }

    override fun setConnectedVPN(uuid: String?) {}

    // ── Plugin Methods ───────────────────────────────────────────────────────

    /**
     * connect({ config: "us-ny" })
     * Loads the .ovpn file from assets/configs/<config>.ovpn and starts OpenVPN.
     */
    @PluginMethod
    fun connect(call: PluginCall) {
        val configName = call.getString("config") ?: run {
            call.reject("config parameter is required")
            return
        }

        // Check/request VPN permission
        val intent = VpnService.prepare(context)
        if (intent != null) {
            // Need to ask user for VPN permission
            pendingConnectCall = call
            currentConfigName = configName
            startActivityForResult(call, intent, VPN_REQUEST_CODE)
            return
        }

        // Already have permission — connect immediately
        startOpenVpn(call, configName)
    }

    /**
     * disconnect()
     * Sends stop signal to OpenVPN service.
     */
    @PluginMethod
    fun disconnect(call: PluginCall) {
        val stopIntent = Intent(context, OpenVPNService::class.java).apply {
            action = OpenVPNService.DISCONNECT_VPN
        }
        context.startService(stopIntent)
        
        val result = JSObject().apply {
            put("success", true)
            put("state", "DISCONNECTED")
        }
        call.resolve(result)
    }

    /**
     * getStatus()
     * Returns current VPN connection level.
     */
    @PluginMethod
    fun getStatus(call: PluginCall) {
        val level = VpnStatus.getLastConnectedVPN()
        val result = JSObject().apply {
            put("state", VpnStatus.getLastConnectedVPN() ?: "DISCONNECTED")
            put("connected", VpnStatus.isVPNActive())
            put("level", level ?: "NOTCONNECTED")
        }
        call.resolve(result)
    }

    // ── Activity Result (VPN Permission) ────────────────────────────────────

    override fun handleOnActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.handleOnActivityResult(requestCode, resultCode, data)
        if (requestCode == VPN_REQUEST_CODE) {
            val configName = currentConfigName
            val call = pendingConnectCall
            if (resultCode == Activity.RESULT_OK && configName != null && call != null) {
                startOpenVpn(call, configName)
            } else {
                call?.reject("VPN permission denied by user")
                pendingConnectCall = null
                currentConfigName = null
            }
        }
    }

    // ── Internal ─────────────────────────────────────────────────────────────

    private fun startOpenVpn(call: PluginCall, configName: String) {
        try {
            // Load .ovpn config from assets/configs/
            val assetPath = "$CONFIG_DIR/$configName.ovpn"
            val inputStream = context.assets.open(assetPath)
            val reader = InputStreamReader(inputStream)

            val cp = ConfigParser()
            cp.parseConfig(reader)

            val profile: VpnProfile = cp.convertProfile()
            profile.mName = configName

            // Save to ProfileManager (ICS-OpenVPN requires this)
            ProfileManager.getInstance(context).addProfile(profile)
            ProfileManager.getInstance(context).saveProfileList(context)
            ProfileManager.getInstance(context).saveProfile(context, profile)

            // Launch OpenVPN
            val startIntent = Intent(context, OpenVPNService::class.java).apply {
                action = Intent.ACTION_MAIN
                putExtra(OpenVPNService.EXTRA_PROFILE_UUID, profile.uuidString)
            }
            context.startService(startIntent)

            // Keep call pending — will resolve when StateListener fires CONNECTED
            pendingConnectCall = call

        } catch (e: Exception) {
            call.reject("Failed to start VPN: ${e.message}")
        }
    }
}