package net.voxvpn.mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.blur
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.*
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

// ─────────────────────────────────────────────────────────────────────────────
// Colour palette
// ─────────────────────────────────────────────────────────────────────────────
private val BgDeep      = Color(0xFF030609)
private val BgMid       = Color(0xFF060B16)
private val BgSurface   = Color(0xFF0A0E1A)
private val CardBg      = Color(0xFF0D1120)
private val CardBorder  = Color(0x12FFFFFF)
private val CyanBright  = Color(0xFF00D4FF)
private val GreenBright = Color(0xFF00FF96)
private val CyanDim     = Color(0xFF006680)
private val SlateText   = Color(0xFF475569)
private val SlateLight  = Color(0xFF94A3B8)
private val White       = Color.White
private val Red         = Color(0xFFEF4444)

private val BgGradient = Brush.verticalGradient(
    colors = listOf(Color(0xFF0B1A2E), BgMid, BgDeep)
)
private val CyanGreenGradient = Brush.linearGradient(
    colors = listOf(CyanBright, GreenBright),
    start = Offset(0f, 0f), end = Offset(600f, 0f)
)
private val ConnectedOrbGradient = Brush.radialGradient(
    colors = listOf(Color(0x38FFFFFF), Color(0x1900FF96), Color(0x0800D4FF), Color.Transparent)
)
private val IdleOrbGradient = Brush.radialGradient(
    colors = listOf(Color(0x08FFFFFF), Color.Transparent)
)

// ─────────────────────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────────────────────
data class VpnServer(val name: String, val country: String, val flag: String)

private val SERVERS = listOf(
    VpnServer("Amsterdam",      "Netherlands",    "🇳🇱"),
    VpnServer("Atlanta",        "United States",  "🇺🇸"),
    VpnServer("Chicago",        "United States",  "🇺🇸"),
    VpnServer("Frankfurt",      "Germany",        "🇩🇪"),
    VpnServer("Johannesburg",   "South Africa",   "🇿🇦"),
    VpnServer("London",         "United Kingdom", "🇬🇧"),
    VpnServer("Los Angeles",    "United States",  "🇺🇸"),
    VpnServer("Madrid",         "Spain",          "🇪🇸"),
    VpnServer("Manchester",     "United Kingdom", "🇬🇧"),
    VpnServer("Melbourne",      "Australia",      "🇦🇺"),
    VpnServer("Miami",          "United States",  "🇺🇸"),
    VpnServer("Milan",          "Italy",          "🇮🇹"),
    VpnServer("New Jersey",     "United States",  "🇺🇸"),
    VpnServer("Paris",          "France",         "🇫🇷"),
    VpnServer("Seattle",        "United States",  "🇺🇸"),
    VpnServer("Silicon Valley", "United States",  "🇺🇸"),
    VpnServer("Singapore",      "Singapore",      "🇸🇬"),
    VpnServer("Sydney",         "Australia",      "🇦🇺"),
    VpnServer("Tokyo",          "Japan",          "🇯🇵"),
    VpnServer("Toronto",        "Canada",         "🇨🇦"),
)

// ─────────────────────────────────────────────────────────────────────────────
// App state
// ─────────────────────────────────────────────────────────────────────────────
enum class Screen { SPLASH, LOGIN, DASHBOARD }
enum class VpnStatus { IDLE, CONNECTING, CONNECTED, DISCONNECTING }

// ─────────────────────────────────────────────────────────────────────────────
// Entry point
// ─────────────────────────────────────────────────────────────────────────────
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                VoxVpnApp()
            }
        }
    }
}

@Composable
fun VoxVpnApp() {
    var screen by remember { mutableStateOf(Screen.SPLASH) }
    var loggedInEmail by remember { mutableStateOf("") }

    AnimatedContent(
        targetState = screen,
        transitionSpec = {
            fadeIn(tween(400)) togetherWith fadeOut(tween(300))
        },
        label = "screen"
    ) { target ->
        when (target) {
            Screen.SPLASH    -> SplashScreen(onComplete = { screen = Screen.LOGIN })
            Screen.LOGIN     -> LoginScreen(onLogin = { email ->
                loggedInEmail = email
                screen = Screen.DASHBOARD
            })
            Screen.DASHBOARD -> DashboardScreen(
                email = loggedInEmail,
                onLogout = { screen = Screen.LOGIN }
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// SPLASH SCREEN
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun SplashScreen(onComplete: () -> Unit) {
    var progress by remember { mutableStateOf(0f) }
    val animProgress by animateFloatAsState(
        targetValue = progress, animationSpec = tween(2400, easing = LinearEasing), label = "progress"
    )
    val pulse = rememberInfiniteTransition(label = "pulse")
    val pulseScale by pulse.animateFloat(
        initialValue = 1f, targetValue = 1.15f,
        animationSpec = infiniteRepeatable(tween(1800, easing = EaseInOutSine), RepeatMode.Reverse),
        label = "pulseScale"
    )
    val ringAlpha by pulse.animateFloat(
        initialValue = 0.6f, targetValue = 0f,
        animationSpec = infiniteRepeatable(tween(2000), RepeatMode.Restart),
        label = "ringAlpha"
    )
    val ringScale by pulse.animateFloat(
        initialValue = 1f, targetValue = 1.6f,
        animationSpec = infiniteRepeatable(tween(2000), RepeatMode.Restart),
        label = "ringScale"
    )

    LaunchedEffect(Unit) {
        progress = 1f
        delay(2600)
        onComplete()
    }

    Box(
        modifier = Modifier.fillMaxSize().background(BgGradient),
        contentAlignment = Alignment.Center
    ) {
        GridOverlay()

        // Ambient glow behind orb
        Box(
            modifier = Modifier
                .size(360.dp)
                .background(
                    Brush.radialGradient(listOf(Color(0x26000000 or 0x0000D4FF.toInt()), Color.Transparent)),
                    CircleShape
                )
                .blur(50.dp)
        )

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            // Orb + rings
            Box(contentAlignment = Alignment.Center, modifier = Modifier.size(180.dp)) {
                // Expanding ring
                Box(
                    modifier = Modifier
                        .size(160.dp)
                        .scale(ringScale)
                        .alpha(ringAlpha)
                        .border(1.dp, CyanBright.copy(alpha = 0.4f), CircleShape)
                )
                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .scale(ringScale * 0.85f)
                        .alpha(ringAlpha * 0.6f)
                        .border(1.dp, CyanBright.copy(alpha = 0.3f), CircleShape)
                )
                // Shield orb
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .scale(pulseScale)
                        .background(
                            Brush.radialGradient(
                                listOf(Color(0x2800D4FF), Color(0x0A003060), Color.Transparent)
                            ),
                            CircleShape
                        )
                        .border(
                            BorderStroke(2.dp, CyanBright.copy(alpha = 0.55f)), CircleShape
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Filled.Security,
                        contentDescription = "VoxVPN",
                        tint = CyanBright,
                        modifier = Modifier.size(44.dp)
                    )
                }
            }

            Spacer(Modifier.height(28.dp))

            Text(
                "VoxVPN",
                color = White,
                fontSize = 36.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = (-1).sp
            )
            Spacer(Modifier.height(4.dp))
            Text(
                "MILITARY-GRADE PRIVACY",
                color = CyanBright,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 4.sp
            )

            Spacer(Modifier.height(60.dp))

            // Progress bar
            Box(
                modifier = Modifier
                    .width(180.dp)
                    .height(2.dp)
                    .background(White.copy(alpha = 0.06f), RoundedCornerShape(2.dp))
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxHeight()
                        .fillMaxWidth(animProgress)
                        .background(CyanGreenGradient, RoundedCornerShape(2.dp))
                )
            }
            Spacer(Modifier.height(10.dp))
            Text(
                "Initializing secure tunnel…",
                color = SlateText,
                fontSize = 11.sp,
                letterSpacing = 1.sp
            )
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// LOGIN SCREEN
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun LoginScreen(onLogin: (String) -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPw by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()

    val pulse = rememberInfiniteTransition(label = "logoPulse")
    val orbScale by pulse.animateFloat(
        1f, 1.08f,
        infiniteRepeatable(tween(2200, easing = EaseInOutSine), RepeatMode.Reverse),
        label = "orbScale"
    )

    Box(modifier = Modifier.fillMaxSize().background(BgGradient)) {
        GridOverlay()

        // Top glow
        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .size(340.dp)
                .offset(y = (-80).dp)
                .background(
                    Brush.radialGradient(listOf(Color(0x2200D4FF), Color.Transparent)),
                    CircleShape
                )
                .blur(60.dp)
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(Modifier.height(72.dp))

            // Logo orb
            Box(contentAlignment = Alignment.Center, modifier = Modifier.size(140.dp)) {
                Box(
                    Modifier.size(130.dp).scale(orbScale)
                        .border(1.dp, CyanBright.copy(0.15f), CircleShape)
                )
                Box(
                    Modifier.size(105.dp).scale(orbScale * 0.9f)
                        .border(1.dp, CyanBright.copy(0.2f), CircleShape)
                )
                Box(
                    modifier = Modifier
                        .size(84.dp)
                        .background(
                            Brush.radialGradient(listOf(Color(0x2000D4FF), Color(0x0A003060), Color.Transparent)),
                            CircleShape
                        )
                        .border(BorderStroke(1.5.dp, CyanBright.copy(0.5f)), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        Icons.Filled.Security,
                        contentDescription = "VoxVPN",
                        tint = CyanBright,
                        modifier = Modifier.size(36.dp)
                    )
                }
            }

            Spacer(Modifier.height(20.dp))
            Text("Welcome Back", color = White, fontSize = 26.sp, fontWeight = FontWeight.Black)
            Text("Sign in to your VoxVPN account", color = SlateText, fontSize = 14.sp)
            Spacer(Modifier.height(28.dp))

            // Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(CardBg.copy(alpha = 0.9f), RoundedCornerShape(28.dp))
                    .border(1.dp, CardBorder, RoundedCornerShape(28.dp))
                    .padding(24.dp)
            ) {
                Column {
                    if (error.isNotEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Red.copy(alpha = 0.09f), RoundedCornerShape(16.dp))
                                .border(1.dp, Red.copy(alpha = 0.25f), RoundedCornerShape(16.dp))
                                .padding(12.dp, 10.dp)
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Filled.Warning, contentDescription = null, tint = Red, modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(8.dp))
                                Text(error, color = Red, fontSize = 13.sp)
                            }
                        }
                        Spacer(Modifier.height(16.dp))
                    }

                    // Email field
                    FieldLabel("Email")
                    VoxTextField(
                        value = email,
                        onValueChange = { email = it },
                        placeholder = "you@example.com",
                        keyboardType = KeyboardType.Email
                    )
                    Spacer(Modifier.height(14.dp))

                    // Password field
                    FieldLabel("Password")
                    VoxTextField(
                        value = password,
                        onValueChange = { password = it },
                        placeholder = "••••••••",
                        visualTransformation = if (showPw) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardType = KeyboardType.Password,
                        trailingIcon = {
                            IconButton(onClick = { showPw = !showPw }) {
                                Icon(
                                    if (showPw) Icons.Filled.VisibilityOff else Icons.Filled.Visibility,
                                    contentDescription = "Toggle password",
                                    tint = SlateText, modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    )
                    Spacer(Modifier.height(20.dp))

                    // Sign In button
                    GradientButton(
                        text = if (loading) "Authenticating…" else "Sign In Securely",
                        icon = if (loading) Icons.Filled.Sync else Icons.Filled.Security,
                        enabled = !loading,
                        onClick = {
                            if (email.isBlank() || password.isBlank()) {
                                error = "Please enter your email and password."
                                return@GradientButton
                            }
                            loading = true
                            error = ""
                            
                            scope.launch {
                                try {
                                    val apiUrl = "https://app--69c84f61d5543b54fe26e1e5.base44.app/functions/authLogin"
                                    val jsonBody = """{"email":"$email","password":"$password","device_id":"android-${System.currentTimeMillis()}","device_name":"Android App","device_type":"android"}"""
                                    
                                    val url = URL(apiUrl)
                                    val connection = url.openConnection() as HttpURLConnection
                                    connection.requestMethod = "POST"
                                    connection.setRequestProperty("Content-Type", "application/json")
                                    connection.doOutput = true
                                    connection.outputStream.write(jsonBody.toByteArray())
                                    
                                    val responseCode = connection.responseCode
                                    val responseBody = connection.inputStream.bufferedReader().readText()
                                    
                                    if (responseCode == 200) {
                                        val jsonResponse = JSONObject(responseBody)
                                        if (jsonResponse.optBoolean("success")) {
                                            onLogin(email)
                                        } else {
                                            error = jsonResponse.optString("message", "Login failed")
                                            loading = false
                                        }
                                    } else {
                                        error = "Server error: $responseCode"
                                        loading = false
                                    }
                                } catch (e: Exception) {
                                    error = "Connection failed: ${e.message}"
                                    loading = false
                                }
                            }
                        }
                    )

                    Spacer(Modifier.height(20.dp))
                    Divider(color = White.copy(alpha = 0.05f))
                    Spacer(Modifier.height(16.dp))

                    Text(
                        "New to VoxVPN?",
                        color = SlateText,
                        fontSize = 12.sp,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Center
                    )
                    Spacer(Modifier.height(10.dp))

                    // Create Account button
                    OutlinedButton(
                        onClick = { /* navigate to signup */ },
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        shape = RoundedCornerShape(16.dp),
                        border = BorderStroke(1.dp, White.copy(alpha = 0.1f)),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = White.copy(alpha = 0.04f),
                            contentColor = SlateLight
                        )
                    ) {
                        Text("Create Account", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }
            }

            Spacer(Modifier.height(24.dp))
            Text("VoxVPN · Military-grade encryption", color = SlateText.copy(0.5f), fontSize = 11.sp)
            Spacer(Modifier.height(24.dp))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD SCREEN
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun DashboardScreen(email: String, onLogout: () -> Unit) {
    var vpnStatus by remember { mutableStateOf(VpnStatus.IDLE) }
    var selectedServer by remember { mutableStateOf(SERVERS[5]) } // London
    var showServerPicker by remember { mutableStateOf(false) }
    var elapsed by remember { mutableStateOf(0) }
    var uploadMb by remember { mutableStateOf(0.0) }
    var downloadMb by remember { mutableStateOf(0.0) }
    var activeTab by remember { mutableStateOf(0) }

    val connected = vpnStatus == VpnStatus.CONNECTED
    val busy = vpnStatus == VpnStatus.CONNECTING || vpnStatus == VpnStatus.DISCONNECTING

    // Timer + mock stats
    LaunchedEffect(vpnStatus) {
        if (vpnStatus == VpnStatus.CONNECTED) {
            while (true) {
                delay(1000)
                elapsed++
                uploadMb += (0.05..0.4).random()
                downloadMb += (0.1..1.2).random()
            }
        } else {
            elapsed = 0; uploadMb = 0.0; downloadMb = 0.0
        }
    }

    // Orb animations
    val pulse = rememberInfiniteTransition(label = "orb")
    val outerRingAlpha by pulse.animateFloat(
        0.5f, 0f,
        infiniteRepeatable(tween(2200), RepeatMode.Restart), label = "outerAlpha"
    )
    val outerRingScale by pulse.animateFloat(
        1f, 1.55f,
        infiniteRepeatable(tween(2200), RepeatMode.Restart), label = "outerScale"
    )
    val innerRingAlpha by pulse.animateFloat(
        0.4f, 0f,
        infiniteRepeatable(tween(2200, delayMillis = 700), RepeatMode.Restart), label = "innerAlpha"
    )
    val innerRingScale by pulse.animateFloat(
        1f, 1.35f,
        infiniteRepeatable(tween(2200, delayMillis = 700), RepeatMode.Restart), label = "innerScale"
    )
    val spinAngle by pulse.animateFloat(
        0f, 360f,
        infiniteRepeatable(tween(1800, easing = LinearEasing)), label = "spin"
    )

    val orbColor = if (connected) GreenBright else if (busy) CyanBright else SlateText.copy(alpha = 0.4f)

    Scaffold(
        containerColor = Color.Transparent,
        bottomBar = {
            BottomNav(activeTab = activeTab, onTabChange = {
                if (it == 2) onLogout() else activeTab = it
            })
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(BgGradient)
                .padding(padding)
        ) {
            GridOverlay()

            // Ambient glow
            Box(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .size(420.dp)
                    .offset(y = (-60).dp)
                    .background(
                        Brush.radialGradient(
                            listOf(
                                if (connected) Color(0x1A00FF96) else Color(0x1200D4FF),
                                Color.Transparent
                            )
                        ),
                        CircleShape
                    )
                    .blur(60.dp)
            )

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(Modifier.height(52.dp))

                // ── Header ──
                Row(
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .background(CyanBright.copy(0.1f), CircleShape)
                                .border(1.dp, CyanBright.copy(0.35f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Filled.Security, null, tint = CyanBright, modifier = Modifier.size(20.dp))
                        }
                        Spacer(Modifier.width(10.dp))
                        Column {
                            Text("VoxVPN", color = White, fontWeight = FontWeight.Black, fontSize = 16.sp)
                            Text(
                                email.take(22) + if (email.length > 22) "…" else "",
                                color = SlateText, fontSize = 11.sp
                            )
                        }
                    }
                    TextButton(
                        onClick = onLogout,
                        colors = ButtonDefaults.textButtonColors(contentColor = SlateText)
                    ) {
                        Icon(Icons.Filled.Logout, null, modifier = Modifier.size(15.dp))
                        Spacer(Modifier.width(4.dp))
                        Text("Log Out", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    }
                }

                Spacer(Modifier.height(28.dp))

                // ── Connection Orb ──
                Box(contentAlignment = Alignment.Center, modifier = Modifier.size(200.dp)) {
                    // Expanding rings (only when connected)
                    if (connected) {
                        Box(
                            Modifier
                                .size(180.dp)
                                .scale(outerRingScale)
                                .alpha(outerRingAlpha)
                                .border(1.5.dp, GreenBright.copy(0.5f), CircleShape)
                        )
                        Box(
                            Modifier
                                .size(150.dp)
                                .scale(innerRingScale)
                                .alpha(innerRingAlpha)
                                .border(1.dp, CyanBright.copy(0.4f), CircleShape)
                        )
                    }

                    // Spinning dashed ring when busy
                    if (busy) {
                        Canvas(modifier = Modifier.size(182.dp)) {
                            drawArc(
                                brush = Brush.sweepGradient(
                                    listOf(Color.Transparent, CyanBright, Color.Transparent)
                                ),
                                startAngle = spinAngle,
                                sweepAngle = 240f,
                                useCenter = false,
                                style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round)
                            )
                        }
                    }

                    // Core orb
                    Box(
                        modifier = Modifier
                            .size(158.dp)
                            .background(
                                if (connected) ConnectedOrbGradient else IdleOrbGradient,
                                CircleShape
                            )
                            .border(
                                BorderStroke(
                                    2.dp,
                                    Brush.linearGradient(
                                        if (connected) listOf(GreenBright.copy(0.6f), CyanBright.copy(0.5f))
                                        else if (busy) listOf(CyanBright.copy(0.5f), CyanDim.copy(0.3f))
                                        else listOf(White.copy(0.1f), White.copy(0.05f))
                                    )
                                ),
                                CircleShape
                            )
                            .clickable(enabled = !busy, onClick = {
                                vpnStatus = if (connected) VpnStatus.DISCONNECTING else VpnStatus.CONNECTING
                            }),
                        contentAlignment = Alignment.Center
                    ) {
                        // Simulate state transition
                        LaunchedEffect(vpnStatus) {
                            when (vpnStatus) {
                                VpnStatus.CONNECTING -> { delay(2200); vpnStatus = VpnStatus.CONNECTED }
                                VpnStatus.DISCONNECTING -> { delay(900); vpnStatus = VpnStatus.IDLE }
                                else -> {}
                            }
                        }

                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                if (connected) Icons.Filled.Security
                                else if (busy) Icons.Filled.Sync
                                else Icons.Filled.WifiOff,
                                contentDescription = null,
                                tint = orbColor,
                                modifier = Modifier.size(42.dp)
                            )
                            Spacer(Modifier.height(6.dp))
                            Text(
                                when (vpnStatus) {
                                    VpnStatus.CONNECTED    -> "Protected"
                                    VpnStatus.CONNECTING   -> "Connecting"
                                    VpnStatus.DISCONNECTING -> "Stopping"
                                    VpnStatus.IDLE         -> "Tap to Connect"
                                },
                                color = orbColor,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp
                            )
                        }
                    }
                }

                Spacer(Modifier.height(10.dp))

                // Live timer
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        Modifier
                            .size(8.dp)
                            .background(if (connected) GreenBright else SlateText.copy(0.3f), CircleShape)
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        if (connected) fmtTime(elapsed) else "Not connected",
                        color = if (connected) GreenBright else SlateText,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(Modifier.height(20.dp))

                // ── Stats cards (only when connected) ──
                AnimatedVisibility(visible = connected) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        listOf(
                            Triple("Secure",              "Status",   GreenBright),
                            Triple("${fmtMb(uploadMb)} MB",   "Upload",   CyanBright),
                            Triple("${fmtMb(downloadMb)} MB", "Download", Color(0xFFA78BFA)),
                        ).forEach { (value, label, color) ->
                            StatCard(value, label, color, Modifier.weight(1f))
                        }
                    }
                }

                if (connected) Spacer(Modifier.height(14.dp))

                // ── Server selector ──
                Column(modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp)) {
                    Text(
                        "SELECTED SERVER",
                        color = SlateText,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 2.sp,
                        modifier = Modifier.padding(start = 4.dp, bottom = 8.dp)
                    )

                    GlassCard(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { showServerPicker = !showServerPicker }
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(selectedServer.flag, fontSize = 28.sp)
                            Spacer(Modifier.width(12.dp))
                            Column(Modifier.weight(1f)) {
                                Text(selectedServer.name, color = White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                Text(selectedServer.country, color = SlateText, fontSize = 12.sp)
                            }
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(Modifier.size(7.dp).background(Color(0xFF10B981), CircleShape))
                                Spacer(Modifier.width(6.dp))
                                Text("Online", color = SlateText, fontSize = 12.sp)
                                Spacer(Modifier.width(6.dp))
                                Icon(
                                    if (showServerPicker) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore,
                                    null, tint = SlateText, modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }

                    // Server list
                    AnimatedVisibility(visible = showServerPicker) {
                        GlassCard(modifier = Modifier.fillMaxWidth().padding(top = 6.dp)) {
                            LazyColumn(modifier = Modifier.heightIn(max = 280.dp)) {
                                items(SERVERS) { server ->
                                    val sel = server.name == selectedServer.name
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .background(if (sel) CyanBright.copy(0.07f) else Color.Transparent)
                                            .clickable {
                                                if (connected) vpnStatus = VpnStatus.IDLE
                                                selectedServer = server
                                                showServerPicker = false
                                            }
                                            .padding(horizontal = 16.dp, vertical = 13.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(server.flag, fontSize = 22.sp, modifier = Modifier.width(34.dp))
                                        Column(Modifier.weight(1f)) {
                                            Text(
                                                server.name,
                                                color = if (sel) CyanBright else White,
                                                fontWeight = FontWeight.SemiBold,
                                                fontSize = 14.sp
                                            )
                                            Text(server.country, color = SlateText, fontSize = 11.sp)
                                        }
                                        if (sel) Icon(Icons.Filled.Check, null, tint = CyanBright, modifier = Modifier.size(16.dp))
                                    }
                                    if (SERVERS.indexOf(server) < SERVERS.size - 1)
                                        Divider(color = White.copy(alpha = 0.04f), thickness = 0.5.dp)
                                }
                            }
                        }
                    }
                }

                Spacer(Modifier.height(20.dp))

                // ── Connect / Disconnect button ──
                Box(modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp)) {
                    if (connected) {
                        OutlinedButton(
                            onClick = { vpnStatus = VpnStatus.DISCONNECTING },
                            modifier = Modifier.fillMaxWidth().height(58.dp),
                            shape = RoundedCornerShape(18.dp),
                            border = BorderStroke(1.dp, Red.copy(alpha = 0.45f)),
                            colors = ButtonDefaults.outlinedButtonColors(
                                containerColor = Red.copy(alpha = 0.1f),
                                contentColor = Red.copy(alpha = 0.85f)
                            )
                        ) {
                            Icon(Icons.Filled.WifiOff, null, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(8.dp))
                            Text("Disconnect", fontWeight = FontWeight.Black, fontSize = 16.sp)
                        }
                    } else {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(58.dp)
                                .background(CyanGreenGradient, RoundedCornerShape(18.dp))
                                .alpha(if (busy) 0.55f else 1f)
                                .clickable(enabled = !busy) { vpnStatus = VpnStatus.CONNECTING },
                            contentAlignment = Alignment.Center
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    if (busy) Icons.Filled.Sync else Icons.Filled.Security,
                                    null, tint = Color.Black, modifier = Modifier.size(20.dp)
                                )
                                Spacer(Modifier.width(8.dp))
                                Text(
                                    if (busy) "Connecting…" else "Connect Now",
                                    color = Color.Black,
                                    fontWeight = FontWeight.Black,
                                    fontSize = 16.sp
                                )
                            }
                        }
                    }
                }

                Spacer(Modifier.height(32.dp))
                Text("VoxVPN · Military-grade privacy", color = SlateText.copy(0.4f), fontSize = 11.sp)
                Spacer(Modifier.height(16.dp))
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Bottom navigation
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun BottomNav(activeTab: Int, onTabChange: (Int) -> Unit) {
    val tabs = listOf(
        Pair("Home",    Icons.Filled.Home),
        Pair("Servers", Icons.Filled.Public),
        Pair("Log Out", Icons.Filled.Logout),
    )
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                Brush.verticalGradient(listOf(Color.Transparent, Color(0xF0060915))),
                shape = RoundedCornerShape(topStart = 0.dp, topEnd = 0.dp)
            )
            .border(BorderStroke(0.5.dp, White.copy(alpha = 0.07f)),
                RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 10.dp),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            tabs.forEachIndexed { idx, (label, icon) ->
                val active = activeTab == idx
                val tint = if (active) CyanBright else SlateText
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .clickable { onTabChange(idx) }
                        .padding(horizontal = 20.dp, vertical = 6.dp)
                ) {
                    Icon(icon, contentDescription = label, tint = tint, modifier = Modifier.size(22.dp))
                    Text(label, color = tint, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
                    if (active) {
                        Spacer(Modifier.height(3.dp))
                        Box(Modifier.size(4.dp).background(CyanBright, CircleShape))
                    }
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reusable composables
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun GridOverlay() {
    Canvas(modifier = Modifier.fillMaxSize().alpha(0.025f)) {
        val spacing = 48.dp.toPx()
        var x = 0f
        while (x <= size.width) {
            drawLine(Color.Cyan, Offset(x, 0f), Offset(x, size.height), strokeWidth = 1f)
            x += spacing
        }
        var y = 0f
        while (y <= size.height) {
            drawLine(Color.Cyan, Offset(0f, y), Offset(size.width, y), strokeWidth = 1f)
            y += spacing
        }
    }
}

@Composable
fun GlassCard(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Box(
        modifier = modifier
            .background(CardBg.copy(alpha = 0.88f), RoundedCornerShape(20.dp))
            .border(1.dp, CardBorder, RoundedCornerShape(20.dp))
    ) { content() }
}

@Composable
fun StatCard(value: String, label: String, color: Color, modifier: Modifier = Modifier) {
    GlassCard(modifier = modifier) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp)
        ) {
            Text(value, color = color, fontWeight = FontWeight.Black, fontSize = 13.sp)
            Text(label.uppercase(), color = SlateText, fontSize = 9.sp, letterSpacing = 1.sp)
        }
    }
}

@Composable
fun FieldLabel(text: String) {
    Text(
        text.uppercase(),
        color = SlateText,
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        letterSpacing = 2.sp,
        modifier = Modifier.padding(bottom = 6.dp)
    )
}

@Composable
fun VoxTextField(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    keyboardType: KeyboardType = KeyboardType.Text,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    trailingIcon: @Composable (() -> Unit)? = null,
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        placeholder = { Text(placeholder, color = SlateText.copy(0.5f), fontSize = 14.sp) },
        singleLine = true,
        visualTransformation = visualTransformation,
        keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
        trailingIcon = trailingIcon,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = White,
            unfocusedTextColor = White,
            cursorColor = CyanBright,
            focusedBorderColor = CyanBright.copy(0.5f),
            unfocusedBorderColor = White.copy(0.07f),
            focusedContainerColor = White.copy(0.04f),
            unfocusedContainerColor = White.copy(0.03f),
        )
    )
}

@Composable
fun GradientButton(text: String, icon: androidx.compose.ui.graphics.vector.ImageVector, enabled: Boolean, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .background(
                if (enabled) CyanGreenGradient else Brush.linearGradient(listOf(CyanDim, CyanDim)),
                RoundedCornerShape(16.dp)
            )
            .alpha(if (enabled) 1f else 0.55f)
            .clickable(enabled = enabled, onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(icon, contentDescription = null, tint = Color.Black, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text(text, color = Color.Black, fontWeight = FontWeight.Black, fontSize = 15.sp)
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
private fun fmtTime(s: Int): String {
    val h = (s / 3600).toString().padStart(2, '0')
    val m = ((s % 3600) / 60).toString().padStart(2, '0')
    val sc = (s % 60).toString().padStart(2, '0')
    return "$h:$m:$sc"
}

private fun fmtMb(v: Double) = "%.1f".format(v)

private fun ClosedFloatingPointRange<Double>.random(): Double =
    start + Math.random() * (endInclusive - start)