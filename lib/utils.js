export const capitalize = (str) => (str.charAt(0).toUpperCase() + str.slice(1)).replace("-", " ").replace("json", "JSON")

export const closeTerminal = (code) => {
    console.clear()

    if (code !== 0) {
            console.error(`❌ Command failed with exit code ${code}`)
    }else {
        console.log("✅ Process finished successfully!")
        console.log("👋 Goodbye!")
    }

    process.exit(code)
}