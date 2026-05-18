package net.voxvpn.mobile

import com.getcapacitor.BridgeActivity

/**
 * MainActivity — registers the VoxVpnPlugin so the React UI can call it.
 */
class MainActivity : BridgeActivity() {
    override fun onCreate(savedInstanceState: android.os.Bundle?) {
        registerPlugin(VoxVpnPlugin::class.java)
        super.onCreate(savedInstanceState)
    }
}