/**
 * The `InternalRequest` class serves as a base class for handling validation of input data.
 * It provides a structure to define validation rules and apply them to the provided data,
 * keeping track of errors and valid data.
 */
class InternalRequest {
    constructor(data) {
        this.data = data;
        this.errors = {};
        this.validData = {};
        this.validate();
    }

    /**
     * This method should be implemented in a subclass to define the rules.
     *
     * @throws {Error} You must define rules in a subclass
     */
    rules() {
        throw new Error('You must define rules in a subclass');
    }

    /**
     * Validates the data fields based on the defined rules.
     *
     * @returns {boolean} - Returns true if all the fields pass validation, otherwise returns false.
     */
    validate() {
        const rules = this.rules();

        for (const field in rules) {
            const value = this.data[field];
            const fieldRules = rules[field];

            for (const rule of fieldRules) {
                this.applyRule(field, value, rule);
            }

            if (!this.errors[field]) {
                this.validData[field] = value;
            }
        }
    }

    /**
     * Applies a validation rule to a given field and its value.
     * @param {string} field - The name of the field being validated.
     * @param {string} value - The value of the field being validated.
     * @param {string} rule - The validation rule to be applied in the format 'ruleName:param'.
     */
    applyRule(field, value, rule) {
        const [ruleName, param] = rule.split(':');

        switch (ruleName) {
            case 'required':
                if (!value) {
                    this.addError(field, `The ${field} is required.`);
                }
                break;

            case 'url':
                const urlRegex = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;
                if (value && !urlRegex.test(value)) {
                    this.addError(field, `The ${field} must be a valid URL.`);
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (value && !emailRegex.test(value)) {
                    this.addError(field, `The ${field} must be a valid email.`);
                }
                break;

            case 'min':
                if (value && value.length < param) {
                    this.addError(field, `The ${field} must be at least ${param} characters long.`);
                }
                break;

            case 'max':
                if (value && value.length > param) {
                    this.addError(field, `The ${field} must not be greater than ${param} characters.`);
                }
                break;
            case 'sometimes':
                if (value !== undefined) {
                    const restOfTheRules = this.rules()[field].filter(r => r !== rule); // Extract the other rules excluding 'sometimes'
                    for (const r of restOfTheRules) {
                        this.applyRule(field, value, r);  // Apply other rules
                    }
                }
                break;

            default:
                break;
        }
    }

    /**
     * Retrieves the errors associated with the object
     *
     * @returns {Array} An array containing the errors
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Retrieves the validated data.
     *
     * @returns {Object} - The validated data.
     */
    validated() {
        return this.validData;
    }

    /**
     * Checks if all validations have passed.
     *
     * @returns {boolean} Returns true if all validations have passed, otherwise false.
     */
    passes() {
        return Object.keys(this.errors).length === 0;
    }

    /**
     * Adds an error message to the specified field.
     *
     * @param {string} field - The field name to add the error message to.
     * @param {string} message - The error message to be added.
     */
    addError(field, message) {
        if (!this.errors[field]) {
            this.errors[field] = [];
        }
        this.errors[field].push(message);
    }
}

export default InternalRequest;