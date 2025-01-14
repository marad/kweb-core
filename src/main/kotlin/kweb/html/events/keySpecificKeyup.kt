package kweb.html.events

import kweb.Element
import kweb.InputElement

private const val ENTER_PRESSED_EVENT_ATTACHED_FLAG = "enterPressedEventAttached"

fun InputElement.attachKeySpecificKeyupEvent(vararg keys: String) {
    require(keys.isNotEmpty()) { "You must supply at least one key" }
    require(ENTER_PRESSED_EVENT_ATTACHED_FLAG !in flags) { "KeySpecificKeyupEvent may only be attached once per element" }
    flags += ENTER_PRESSED_EVENT_ATTACHED_FLAG
    this.execute("""
        $jsExpression.addEventListener("keyup", function(origEvent) {
            var keys = [${keys.map { "\"$it\"" }.joinToString(separator = ",")}]
            if (keys.includes(origEvent.key)) {
                if (window.CustomEvent) {
                  var keySpecificKeyUpEvent = new CustomEvent('keySpecificKeyUpEvent');
                } else {
                  var keySpecificKeyUpEvent = document.createEvent('keySpecificKeyUpEvent');
                  enterPressedEvent.initCustomEvent('keySpecificKeyUpEvent', true, true, origEvent);
                }

                $jsExpression.dispatchEvent(keySpecificKeyUpEvent);
            }
        });
    """.trimIndent())
}

fun OnReceiver<Element>.keySpecificKeyup(callback: (event: KeyboardEvent) -> Unit): Element {
    require(source.flags.contains(ENTER_PRESSED_EVENT_ATTACHED_FLAG)) { "InputElement.attachKeySpecificKeyupEvent() must be called before listening for keySpecificKeyup" }
    return this.event("keySpecificKeyUpEvent", eventType = KeyboardEvent::class, callback = callback)
}

fun OnImmediateReceiver<Element>.keySpecificKeyup(callback: () -> Unit): Element {
    require(source.flags.contains(ENTER_PRESSED_EVENT_ATTACHED_FLAG)) { "InputElement.attachKeySpecificKeyupEvent() must be called before listening for keySpecificKeyup" }
    return event("keySpecificKeyUpEvent", callback = callback)
}
