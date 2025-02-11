package kweb.html.style

import kweb.Element

/**
 * Created by ian on 2/12/17.
 */

class StyleReceiver(private val parent: Element) {
    fun setDisplay(value: DisplayValues) {
        parent.execute("${parent.jsExpression}.style.display=\"$value\";")
    }

    fun setWidth(value: String) {
        parent.execute("${parent.jsExpression}.style.width=\"$value\";")
    }

    fun remove() {
        parent.removeAttribute("style")
    }

    enum class DisplayValues {
        none, block
    }
}