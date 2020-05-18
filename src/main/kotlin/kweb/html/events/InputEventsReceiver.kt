package kweb.html.events

interface InputEventsReceiver

// TODO: define event type
fun <ON, T> ON.input(callback: (event: Event) -> Unit) where ON: NewOnReceiver<T>, T: InputEventsReceiver =
        event("input", eventType = Event::class, callback = callback)
fun <ION, T> ION.input(callback: () -> Unit) where ION: NewOnImmediateReceiver<T>, T: InputEventsReceiver = event("input", callback)
