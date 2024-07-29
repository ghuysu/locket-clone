"use strict"

const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.{8,})/
    return regex.test(password)
}

module.exports = {
    validatePassword
}