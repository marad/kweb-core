package kweb.demos.errorDetection.buildPageTime

import kweb.Kweb

/**
 * Created by ian on 3/10/17.
 */

fun main(args: Array<String>) {
    Kweb(port = 1234, debug = true, buildPage = {
        Thread.sleep(1000)
    })
    Thread.sleep(2000)
}