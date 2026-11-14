package hu.winterarc.companion

import android.os.Bundle
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.view.WindowManager
import android.view.WindowInsets
import android.widget.*
import androidx.activity.ComponentActivity
import androidx.lifecycle.lifecycleScope
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.HealthConnectFeatures
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.*
import androidx.health.connect.client.records.metadata.DataOrigin
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch
import java.time.Instant
import java.time.Duration
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import kotlin.reflect.KClass

const val PRIVACY = "Ez a tesztverzió csak a telefonodon mutat előnézetet az utolsó 7 nap Health Connect adataiból. A Samsung Health lépéseit, alvási időszakait, edzéseit és pulzusmintáit, valamint a Wim Hof mindfulness- és edzésbejegyzéseit olvassa. Minden engedély külön választható és visszavonható. Nincs internet-hozzáférés, felhőfeltöltés, háttérolvasás, fájlmentés, analitika vagy egészségadat-naplózás. Az előnézet az app háttérbe kerülésekor törlődik. Nem módosítja a forrásadatokat. A teljes Winter Arc-szinkron ebben a verzióban még nem érhető el."

class PrivacyActivity: ComponentActivity() {
 override fun onCreate(state: Bundle?) {
  super.onCreate(state)
  val text=TextView(this).apply { this.text=PRIVACY; textSize=18f; setPadding(28,64,28,48) }
  setContentView(ScrollView(this).apply { addView(text) })
 }
}

class MainActivity: ComponentActivity() {
 private lateinit var column: LinearLayout
 private lateinit var status: TextView
 private lateinit var output: TextView
 private lateinit var preview: Button
 private lateinit var authorize: Button
 private var client: HealthConnectClient?=null
 private var reading: Job?=null
 private val samsung=setOf(DataOrigin("com.sec.android.app.shealth"))
 private val wim=setOf(DataOrigin("nl.deckeron.apps.innerfire"))
 private val formatter=DateTimeFormatter.ofPattern("yyyy.MM.dd. HH:mm").withZone(ZoneId.of("Europe/Budapest"))
 private val permissionLauncher=registerForActivityResult(PermissionController.createRequestPermissionResultContract()) {
  status.text="Az engedélyválasztás lezárult. Az adatolvasást az Előnézet betöltése gombbal indíthatod."
 }
 override fun onCreate(state: Bundle?) {
  super.onCreate(state)
  window.addFlags(WindowManager.LayoutParams.FLAG_SECURE)
  column=LinearLayout(this).apply { orientation=LinearLayout.VERTICAL; setPadding(24,24,24,24); setBackgroundColor(Color.rgb(11,16,23)) }
  val scroll=ScrollView(this).apply { addView(column); setOnApplyWindowInsetsListener { v,insets ->
   val bars=insets.getInsets(WindowInsets.Type.systemBars());v.setPadding(bars.left,bars.top,bars.right,bars.bottom);insets
  } }
  setContentView(scroll)
  label("WINTER ARC",30f).apply { typeface=Typeface.create("serif",Typeface.NORMAL);setTextColor(Color.rgb(197,164,109)) }
  label("Health Connect · helyi előnézet",20f)
  label("Első tesztverzió. Adataid most csak ezen a telefonon jelennek meg.",16f)
  status=label("Kapcsolat ellenőrzése…",16f)
  authorize=button("Olvasási engedélyek kiválasztása") { requestAccess() }
  preview=button("Előnézet betöltése · 7 nap") { loadPreview() }
  button("Adatkezelési tájékoztató") { startActivity(Intent(this,PrivacyActivity::class.java)) }
  button("Előnézet törlése") { reading?.cancel();output.text="Az előnézet üres.";preview.isEnabled=client!=null;authorize.isEnabled=client!=null }
  output=label("Még nem olvastunk adatot. Először válaszd ki az engedélyezett adattípusokat.",17f)
  if(HealthConnectClient.getSdkStatus(this)==HealthConnectClient.SDK_AVAILABLE) {
   client=HealthConnectClient.getOrCreate(this)
   status.text="Health Connect elérhető. A felhőszinkron még nincs bekapcsolva."
  } else {
   status.text="A Health Connect nem elérhető vagy frissítést igényel. Ellenőrizd a telefon beállításaiban."
   authorize.isEnabled=false;preview.isEnabled=false
  }
 }
 private fun label(value:String,size:Float):TextView=TextView(this).apply {
  text=value;textSize=size;setTextColor(Color.rgb(232,237,242));setPadding(0,12,0,12);column.addView(this)
 }
 private fun button(value:String,action:()->Unit):Button=Button(this).apply {
  text=value;isAllCaps=false;minHeight=56;setOnClickListener { action() };column.addView(this)
 }
 private fun mindfulnessAvailable()=client?.features?.getFeatureStatus(HealthConnectFeatures.FEATURE_MINDFULNESS_SESSION)==HealthConnectFeatures.FEATURE_STATUS_AVAILABLE
 private fun requestAccess() {
  val permissions=mutableSetOf(
   HealthPermission.getReadPermission(StepsRecord::class),HealthPermission.getReadPermission(SleepSessionRecord::class),
   HealthPermission.getReadPermission(ExerciseSessionRecord::class),HealthPermission.getReadPermission(HeartRateRecord::class))
  if(mindfulnessAvailable()) permissions.add(HealthPermission.getReadPermission(MindfulnessSessionRecord::class))
  try {permissionLauncher.launch(permissions)} catch(_:Exception) {status.text="Az engedélykérő nem nyitható meg. Próbáld újra a Health Connect frissítése után."}
 }
 private suspend fun <T:Record> records(type:KClass<T>,filter:TimeRangeFilter,origins:Set<DataOrigin>):List<T> {
  val all=mutableListOf<T>();var token:String?=null
  do {
   val page=client!!.readRecords(ReadRecordsRequest(recordType=type,timeRangeFilter=filter,dataOriginFilter=origins,pageSize=500,pageToken=token))
   all.addAll(page.records);token=page.pageToken
   if(all.size>10000) throw IllegalStateException("Túl sok bejegyzés")
  } while(token!=null)
  return all
 }
 private fun loadPreview() {
  val hc=client?:return
  reading?.cancel();output.text="Betöltés…";preview.isEnabled=false;authorize.isEnabled=false
  reading=lifecycleScope.launch {
   try {
    val grants=hc.permissionController.getGrantedPermissions()
    val end=Instant.now();val start=end.minus(Duration.ofDays(7));val filter=TimeRangeFilter.between(start,end)
    val lines=mutableListOf("Időszak: ${formatter.format(start)} – ${formatter.format(end)} (Budapest)")
    suspend fun section(title:String,type:KClass<out Record>,read:suspend()->String) {
     if(HealthPermission.getReadPermission(type) !in grants) {lines.add("$title\nNincs olvasási engedély.");return}
     try {lines.add("$title\n${read()}")} catch(e:CancellationException){throw e} catch(_:SecurityException){lines.add("$title\nAz engedély megszűnt. Válaszd ki újra az engedélyeket.")} catch(_:Exception){lines.add("$title\nNem sikerült teljesen beolvasni. Nem mutatunk részleges eredményt; próbáld újra.")}
    }
    section("Samsung Health · lépések",StepsRecord::class) {
     val result=hc.aggregate(AggregateRequest(metrics=setOf(StepsRecord.COUNT_TOTAL),timeRangeFilter=filter,dataOriginFilter=samsung))
     result[StepsRecord.COUNT_TOTAL]?.let { "$it lépés a teljes időszakban." }?:"Nincs átadott lépésadat az időszakban."
    }
    section("Samsung Health · alvás",SleepSessionRecord::class) {
     val rows=records(SleepSessionRecord::class,filter,samsung).sortedByDescending {it.endTime}
     if(rows.isEmpty()) "Nincs átadott alvásbejegyzés." else "${rows.size} alvási időszak. Legutóbbiak:\n"+rows.take(3).joinToString("\n") { "${formatter.format(it.startTime)} – ${formatter.format(it.endTime)}" }+"\nAz időablak nem azonos a ténylegesen átaludt idővel vagy az önértékelt alvásminőséggel."
    }
    section("Samsung Health · edzések",ExerciseSessionRecord::class) {
     val rows=records(ExerciseSessionRecord::class,filter,samsung)
     "${rows.size} átadott edzésbejegyzés."+ (rows.maxByOrNull{it.startTime}?.let {"\nLegutóbbi kezdete: ${formatter.format(it.startTime)}"}?:"")
    }
    section("Samsung Health · pulzus",HeartRateRecord::class) {
     val sample=records(HeartRateRecord::class,filter,samsung).flatMap {it.samples}.maxByOrNull {it.time}
     sample?.let {"Utolsó rögzített minta: ${it.beatsPerMinute} / perc\n${formatter.format(it.time)}\nEz nem élő pulzusmérés."}?:"Nincs átadott pulzusminta."
    }
    if(mindfulnessAvailable()) section("Wim Hof · mindfulness",MindfulnessSessionRecord::class) {
     val rows=records(MindfulnessSessionRecord::class,filter,wim)
     "${rows.size} átadott mindfulness-bejegyzés."+(rows.maxByOrNull{it.startTime}?.let {"\nLegutóbbi: ${formatter.format(it.startTime)} – ${formatter.format(it.endTime)}"}?:"")
    } else lines.add("Wim Hof · mindfulness\nEz az adattípus ezen a Health Connect-verzión nem elérhető.")
    section("Wim Hof · edzésként átadott gyakorlások",ExerciseSessionRecord::class) {
     val rows=records(ExerciseSessionRecord::class,filter,wim)
     "${rows.size} átadott edzésbejegyzés. A mindfulness-bejegyzésekkel átfedhetnek, ezért nem adjuk össze őket."
    }
    output.text=lines.joinToString("\n\n")
    status.text="Előnézet kész · nincs feltöltés. Az üres eredmény azt is jelentheti, hogy a forrásapp még nem adott át adatot."
   } catch(e:CancellationException){throw e} catch(_:Exception){output.text="Az előnézet nem tölthető be. Ellenőrizd az engedélyeket, majd próbáld újra."}
   finally {preview.isEnabled=true;authorize.isEnabled=true}
  }
 }
 override fun onStop() {
  super.onStop();reading?.cancel()
  if(::output.isInitialized) output.text="Az előnézetet elrejtettük és töröltük. Új olvasáshoz nyomd meg az Előnézet betöltése gombot."
 }
}
