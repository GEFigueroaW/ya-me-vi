// Build configuration for Firebase integration with WebIntoApp
// This is the PROJECT-LEVEL build.gradle.kts file

plugins {
    // Existing plugins...
    
    // Add the dependency for the Google services Gradle plugin
    id("com.google.gms.google-services") version "4.4.3" apply false
}

// Project-level configurations
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

// Clean task
tasks.register("clean", Delete::class) {
    delete(rootProject.buildDir)
}
