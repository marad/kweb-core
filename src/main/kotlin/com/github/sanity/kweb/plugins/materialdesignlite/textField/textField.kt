package com.github.sanity.kweb.plugins.materialdesignlite.textField

import com.github.salomonbrys.kotson.toJson
import com.github.sanity.kweb.dom.attributes.attr
import com.github.sanity.kweb.dom.attributes.classes
import com.github.sanity.kweb.dom.attributes.set
import com.github.sanity.kweb.dom.element.creation.*
import com.github.sanity.kweb.plugins.materialdesignlite.MDLCreator

/**
 * Created by ian on 1/21/17.
 */


fun MDLCreator.textField(floatingLabel: Boolean = false, expandable: Boolean = false, disabled: Boolean = false, isInvalid: Boolean = false): MDLTextFieldCreator =
        MDLTextFieldCreator(div(attr.classes("mdl-textfield", "mdl-js-textfield")
                .classes("mdl-textfield--floating-label", onlyIf = floatingLabel)
                .classes("mdl-textfield--expandable", onlyIf = expandable)
                .classes("is-invalid", onlyIf = isInvalid)
                .set("disabled", disabled)))


class MDLTextFieldCreator internal constructor(val e: ElementCreator) : ElementCreator(e.element) {
    fun input(type: InputType? = null, pattern: String? = null, attributes: MutableMap<String, Any> = attr)
            = input(type, attributes = attributes.classes("mdl-textfield__input").set("pattern", pattern))

    fun label(forInput: InputElement, attributes: MutableMap<String, Any> = attr)
            = label(attributes
            .classes("mdl-textfield__label")
            .set("for", forInput.id ?: throw RuntimeException("Input element $forInput must specify an id to be referenced by a label")))

    fun error(attributes: MutableMap<String, Any> = attr) = span(attributes.classes("mdl-textfield__error"))

    /**
     * See [MDL Source](https://github.com/google/material-design-lite/blob/mdl-1.x/src/textfield/textfield.selectorExpression#L216)
     *
     * TODO: This shouldn't go here
     */
    fun change(newValue : String) {
        e.element.execute("${e.element.jsExpression}.MaterialTextfield.change(${newValue.toJson()});")
    }
}
