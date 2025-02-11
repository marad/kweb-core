package kweb.plugins.jqueryCore

import com.github.salomonbrys.kotson.fromJson
import kweb.html.events.MouseEvent
import kweb.util.gson
import kweb.util.random
import kweb.util.toJson
import java.util.*
import kotlin.reflect.full.memberProperties

/**
 * Created by ian on 2/22/17.
 */

open class JQueryOnReceiver(val parent: JQueryReceiver) {
    fun event(event: String, returnEventFields: Set<String> = Collections.emptySet(), callback: (String) -> Unit): JQueryReceiver {
        val callbackId = Math.abs(random.nextInt())
        val eventObject = "{" + returnEventFields.map { "\"$it\" : event.$it" }.joinToString(separator = ", ") + "}"
        parent.webBrowser.executeWithCallback("${parent.selectorExpression}.on(${event.toJson()}, function(event) {callbackWs($callbackId, $eventObject);})", callbackId) { payload ->
            callback.invoke(payload.toString())
        }
        return parent
    }

    inline fun <reified T : Any> event(eventName: String, crossinline callback: (T) -> Unit): JQueryReceiver {
        // TODO: Should probably cache this rather than do the reflection every time
        val eventPropertyNames = T::class.memberProperties.map { it.name }.toSet()
        event(eventName, eventPropertyNames) { propertiesAsString ->
            val props: T = gson.fromJson(propertiesAsString)
            callback(props)
        }
        return parent
    }

    // From http://www.w3schools.com/jquery/jquery_ref_events.asp, incomplete
    fun blur(callback: (MouseEvent) -> Unit) = event("blur", callback = callback)
    fun click(callback: (MouseEvent) -> Unit) = event("click", callback = callback)
    fun dblclick(callback: (MouseEvent) -> Unit) = event("dblclick", callback = callback)
    fun focus(callback: (MouseEvent) -> Unit) = event("focus", callback = callback)
    fun focusin(callback: (MouseEvent) -> Unit) = event("focusin", callback = callback)
    fun focusout(callback: (MouseEvent) -> Unit) = event("focusout", callback = callback)
    fun hover(callback: (MouseEvent) -> Unit) = event("hover", callback = callback)
    fun mouseup(callback: (MouseEvent) -> Unit) = event("mouseup", callback = callback)
    fun mousedown(callback: (MouseEvent) -> Unit) = event("mousedown", callback = callback)
    fun mouseenter(callback: (MouseEvent) -> Unit) = event("mouseenter", callback = callback)
    fun mouseleave(callback: (MouseEvent) -> Unit) = event("mouseleave", callback = callback)
    fun mousemove(callback: (MouseEvent) -> Unit) = event("mousemove", callback = callback)
}