# Creating Dynamic Forms with Yup in JavaScript

> ~3mins reading -
>5/7/2024  

In modern web applications, forms are a fundamental component. Validating these forms dynamically based on different types and formats of questions can be challenging. In this post, I'll show you how to leverage the power of Yup, a JavaScript library for data validation, to create dynamic forms with ease.

## Why Use Yup?

Yup is a powerful and flexible library that provides a simple and intuitive API for defining validation schemas. It supports a wide range of validation rules and integrates seamlessly with popular form libraries like Formik and React Hook Form. Here are some reasons why Yup is a good choice for form validation:

1. **Easy to Use**: Yup's chainable syntax makes it easy to define complex validation logic in a concise and readable manner.
2. **Flexible Validation**: Yup supports various validation rules, including string, number, date, boolean, and object validation.
3. **Customizable Error Messages**: Yup allows you to customize error messages based on the validation rule or the specific field being validated.
4. **Integration with Form Libraries**: Yup integrates well with form libraries, making it easy to incorporate validation logic into your form handling workflows.
5. **Server-side and Client-side Validation**: Yup can be used both on the server-side and client-side, making it versatile for different environments.


## Implementing Dynamic Form Validation with Yup

Let's dive into the implementation of dynamic form validation using Yup. The following code demonstrates how to create a Yup validator for dynamic forms with questions and answers of different types and formats.

### Example of Question Schema

Lets create a Question schema

``` javascript
type Question ={
    id: number;
    name:string;
    code:string;
    type:string;
    isRequired: boolean;
    isDisabled: boolean;
    isParentQuestion: boolean;
    enabledByParentQuestionId: number;
    errorMessage: string;
    validationRules:ValidationRules
}

type ValidationRules = Array<{
    rule: ValidationRule;
}>

type ValidationRule ={
    [key:string]: {
        pattern: string;
        errorMessage:string;
    };
}
```

### Code Implementation

This is the mappings for questions the types 
```javascript

const YupQuestionType: { [key: string]: any; } = {
    'text': (question: Question) => yup.string().nullable(),
    'number': (question: Question) => yup.number().nullable(),    
    'date': (question: Question) => yup.date().nullable().
    'select': (question: Question) => yup.array().nullable(),
};

```

We will continue with an example of  validation rules. It's an array of validations rules based on the type of fields
```javascript
const ValidationRules = [
    {
        email:{
            pattern:"/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;",
            errorMesage: "This is not a valid email"

        }
        pastDateOnly:{
            errorMesage: "The date must be in the past",
            pattern:"",
        },
        number: {
            pattern: /^\d+$/,
            errorMessage: "This field must contain numbers only"
        }
    }
]

```

We will add some other helper functions like the __getTypeErrors__ for applying custom error messages if we want or return the default errorMessage of each questions. Also we are going to create the __isCustomValidationRulesValid__ for handling the custom error messages for each questions with extra validation rules based on the existing ValidatationRule list.

``` javascript 
const getTypeErrors = (x: { questionTypeId: string, requiredErrorMessage: string }) => {
    //you can override existing errorMessages here
    return x.errorMessage;
};

const isCustomValidationRulesValid = (
  question: { code: string; errorMessage: string; validationRules: { [x: string]: any }; },
  ValidationRules: any,
  value: any,
) => {
 const validationRules = question.ValidationRules;
    const errors = [];

    Object.keys(validationRules).forEach(ruleKey => {
        const rule = validationRules[ruleKey];
        const validationRule = ValidationRules[ruleKey];

        if (validationRule) {
            if (validationRule.pattern && !new RegExp(validationRule.pattern).test(value)) {
                errors.push(validationRule.errorMessage);
            }
            if (ruleKey === 'pastDateOnly' && new Date(value) >= new Date()) {
                errors.push(validationRule.errorMessage);
            }
        }
    });

    return errors.length > 0 ? errors : null;
};


```


``` javascript
import * as Yup from 'yup';

export const YupValidator = (questions, questionValidationRules) => {
  const yupObject = {};

  // 1. Loop through all the questions
  questions.forEach((question) => {
    const validations = [
      // 2. Construct base Yup schema
     () => YupInputType[question.type](question),
      // 3. Check validations on parent & required questions
      question.isParentQuestion && question.isRequired && ((schema) => schema.required(question.errorMessage)),
      // 4. Check validations on non-parent & required questions
      !question.isParentQuestion && question.isRequired && ((schema) => {
        const parentQuestion = questions.find((q) => q.id === question.enabledByParentQuestionId)?.code;
        return parentQuestion ? schema.typeError(getTypeErrors(question)).when(parentQuestion, {
          is: (val) => (val && Object.values(val).length > 0) ,
          then: (s) => s.required(question.errorMessage),
        }) : null;
      }),
      // 5. Check for custom validation rules
      question.questionValidationRules && ((schema) => schema.test(question.code, async (value, context) => {
        const errorMessage = await isCustomValidationRulesValid(question, validationRules, context, value);
        if (errorMessage) {
          return context.createError({
            path: context.path,
            message: errorMessage,
          });
        }
        return true;
      })),

      // 6. Disabled questions don't need validation
      ( question.isDisabled) && (() => null),
    ].filter(Boolean);

    // 7. Create the Yup object by combining the validations per question
    yupObject[question.code] = validations.reduce((schema, validation) => schema ? validation(schema)?.concat(schema) : validation(schema), null);
  });

  // 8. Return the schema
  return Yup.object(yupObject);
};

```

### Implementation

Supposing that we would like to create a form of 4 questions consisting of Name,Age,Email and Date of dirth we need to structure our dyanmic questiosn like this

``` javascript 
 const questions: Question[] = [
    {
        id: 1,
        name: "Name",
        code: "name",
        type: "text",
        isRequired: true,
        isDisabled: false,
        isParentQuestion: false,
        enabledByParentQuestionId: 0,
        errorMessage: "Name is required",
        validationRules: [
            {
                pattern: "^[a-zA-Z ]+$",
                errorMessage: "Name must contain only letters and spaces"
            }
        ]
    },
    {
        id: 2,
        name: "Age",
        code: "age",
        type: "number",
        isRequired: true,
        isDisabled: false,
        isParentQuestion: false,
        enabledByParentQuestionId: 0,
        errorMessage: "Age is required",
        validationRules: [
            {
                pattern: "^\\d+$",
                errorMessage: "Age must be a positive integer"
            }
        ]
    },
    {
        id: 3,
        name: "Email",
        code: "email",
        type: "email",
        isRequired: true,
        isDisabled: false,
        isParentQuestion: false,
        enabledByParentQuestionId: 0,
        errorMessage: "Email is required",
        validationRules: [
            {
                pattern: "^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$",
                errorMessage: "This is not a valid email"
            }
        ]
    },
    {
        id: 4,
        name: "Date of Birth",
        code: "dateOfBirth",
        type: "date",
        isRequired: true,
        isDisabled: false,
        isParentQuestion: false,
        enabledByParentQuestionId: 0,
        errorMessage: "Date of Birth is required",
        validationRules: [
            {
                pattern: "",
                errorMessage: "The date must be in the past"
            }
        ]
    }
];
```

First,  ensure you have the necessary dependencies installed:
```console 
npm install formik yup
```
Here's how you can create a Yup validation schema for the questions and use it with Formik:



``` javascript
const Form = ():JSX.Element => {
    return (
        <Formik
            initialValues={{ name: '', age: '', email: '', dateOfBirth: '' }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                console.log(values);
            }}
        >
            {({ isSubmitting }) => (
                <Form>
                    {questions.map(question => (
                        <div key={question.id}>
                            <label htmlFor={question.code}>{question.name}</label>
                            <Field type={question.type} name={question.code} />
                            <ErrorMessage name={question.code} component="div" />
                        </div>
                    ))}
                    <button type="submit" disabled={isSubmitting}>
                        Submit
                    </button>
                </Form>
            )}
        </Formik>
    );
};
```

#### Explanation 

Dependencies

Explanation
*Questions Array* : The questions array contains the four questions with their respective validation rules.

*Yup Validation Schema* :

The validationSchema is created by reducing the questions array into a Yup schema object.
For each question, a base validator is created using Yup.string().
If the question is required, the required method is added to the validator.
Each validation rule is applied using the matches method for pattern matching.
For the dateOfBirth field, a custom test is added to ensure the date is in the past.

*Formik Setup* :

The Formik component is used to manage the form state and handle validation.
initialValues: The initial values for the form fields.
validationSchema: The Yup validation schema.
onSubmit: The function to call when the form is submitted.
Form Fields:


**Conclusion**
The form fields are dynamically generated based on the questions array.
Each field uses the Field component from Formik, and validation errors are displayed using the ErrorMessage component.


> > > Have a good one!
