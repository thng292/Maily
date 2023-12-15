export const validateEmail = (email: string) => {
    // Email validation logic here
    // You can use a regular expression or any other validation method

    // Example regular expression for email validation
    // console.log(email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}
