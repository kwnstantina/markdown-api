# Building Multi-Page Forms in React Native with React Hook Form and Zod Validation

> ~3mins reading -
> 23/8/2024

Creating multi-page forms can be a challenge, especially when it comes to managing state, handling validation, and submitting data. In this guide, we'll explore how to create a multi-page form in React Native using react-hook-form for form handling and zod for validation. We'll also leverage React's useReducer and Context API for state management.

## Prerequisites

Before we start, make sure you have the following dependencies installed:

```code
npm install react-hook-form zod @hookform/resolvers
```

## Setting Up the Form Context

First, we need to create a context to manage the form state across different pages. This context will hold the current step, form data, errors, and more.

```javascript
import React, { createContext, useContext, useReducer, ReactNode } from "react";
import { useForm, FormProvider as FormHookProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface FormState {
  step: number;
  formData: { [key: string]: any };
  errors: { [key: string]: any };
  isSubmitting: boolean;
}

type FormAction =
  | { type: "NEXT_STEP"; payload?: any }
  | { type: "PREVIOUS_STEP" }
  | { type: "SET_ERRORS"; payload: any }
  | { type: "CLEAR_ERRORS" }
  | { type: "SUBMIT" };

const initialState: FormState = {
  step: 1,
  formData: {},
  errors: {},
  isSubmitting: false,
};

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "NEXT_STEP":
      return {
        ...state,
        step: state.step + 1,
        formData: { ...state.formData, ...action.payload },
      };
    case "PREVIOUS_STEP":
      return { ...state, step: state.step - 1 };
    case "SET_ERRORS":
      return { ...state, errors: action.payload };
    case "CLEAR_ERRORS":
      return { ...state, errors: {} };
    case "SUBMIT":
      return { ...state, isSubmitting: true };
    default:
      return state;
  }
};

export const FormContext = createContext<{ state: FormState; dispatch: React.Dispatch<FormAction> }>(initialState as any);

export const FormProvider = ({ children, initialFormValues, validationSchema }: { children: ReactNode; initialFormValues?: any; validationSchema?: z.ZodObject<any> }) => {
  const methods = useForm({
    defaultValues: initialFormValues,
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
  });

  const [state, dispatch] = useReducer(formReducer, {
    ...initialState,
    formData: initialFormValues,
  });

  return (
    <FormContext.Provider value={{ state, dispatch }}>
      <FormHookProvider {...methods}>{children}</FormHookProvider>
    </FormContext.Provider>
  );
};

```

## Creating the Multi-Page Form

Now that we have the form context set up, we can start building our multi-page form. We'll define a FormProvider.Body component that will render the current step of the form.

```javascript
export const FormProviderBody = ({
  steps,
}: {
  steps: { [key: number]: ReactNode },
}) => {
  const { state } = useContext(FormContext);
  return <>{steps[state.step]}</>;
};
```

## Handling Pagination

To navigate between the different steps of the form, we'll create a custom hook called **usePagination**. This hook will provide methods to move to the next or previous step and handle form submission.

```javascript
export const usePagination = ({
  steps,
  handleSubmit,
}: {
  steps: { [key: number]: ReactNode },
  handleSubmit?: (data: any) => void,
}) => {
  const { state, dispatch } = useContext(FormContext);
  const methods = useFormContext();

  const isLastStep = state.step === Object.keys(steps).length;

  const handleNext = async () => {
    const isValid = await methods.trigger();

    if (isValid) {
      dispatch({ type: "NEXT_STEP", payload: methods.getValues() });
      if (isLastStep && handleSubmit) {
        handleSubmit(methods.getValues());
        dispatch({ type: "SUBMIT" });
      }
    } else {
      dispatch({ type: "SET_ERRORS", payload: methods.formState.errors });
    }
  };

  const handleBack = () => {
    if (state.step > 1) {
      dispatch({ type: "PREVIOUS_STEP" });
    }
  };

  return {
    handleNext,
    handleBack,
    isLastStep,
    currentStep: state.step,
  };
};
```

## Example Form Schema with Zod

We'll define a simple form schema using zod to validate our form data. This schema will be used in the FormProvider to validate each step of the form.

```javascript
export const zodCreateFormSchema = z.object({
  location: z
    .string()
    .min(6, { message: "Should contain at least 6 characters" })
    .max(50, { message: "Location is too big" }),
  title: z
    .string()
    .min(1, { message: "Title is too short" })
    .max(20, { message: "Title is too big" }),
  description: z
    .string()
    .min(3, { message: "Description is too short" })
    .max(100, { message: "Description is too big" }),
  dateStart: z.string().min(1),
  dateEnd: z.string().min(1),
  timeStart: z.string().min(1),
  timeEnd: z.string().min(1),
  participant: z
    .number()
    .min(1)
    .max(10, { message: "Participants should be less than 10" })
    .optional(),
  cost: z.string().min(0).max(5).optional(),
  interest: z.string().min(1, { message: "Please select an interest" }),
  subInterests: z.array(z.any()),
});
```

## Putting It All Together

Finally, let's see how everything fits together by creating a simple multi-page form component by attaching some examples:  


``` javascript

const steps = {
  1: <LocationScreen />,
  2: <PostDetails />,
  3: <CategoriesScreen />,
} as Record<string, React.ReactNode>;


const initialFormValues = {
  1: {
    location: "",
  },
  2: {
    title: "",
    description: "",
    dateStart: new Date().toLocaleDateString("en"),
    dateEnd: new Date().toLocaleDateString("en"),
    timeStart: "13:30",
    timeEnd: "13:30",
    participant: 1,
    cost: "",
  },
  3: {
    interest: "",
    subInterests: [],
  },
} as Record<string, Record<string, string | number | Array<string>>>;

const handleSubmit = (data: any) => {
    console.log("Form submitted:", data);
};

```

``` javascript
const CreateActivityScreen: React.FC = (): JSX.Element => {
  return (
    <FormProvider
      initialFormValues={initialFormValues}
      validationSchema={zodCreateFormSchema}
    >
      <FormProvider.Wrapper>
        <CreateActivityHeader steps={steps} />
        <FormProvider.Body steps={steps} />
        <PaginationWrapper.Pagination>
          <PaginationWrapper.Buttons>
            <Pagination
              steps={steps}
              keyboardStatus={keyboardStatus}
              handleSubmit={handleSubmit}
            />
          </PaginationWrapper.Buttons>
          <PaginationWrapper.Pagination>
            <PaginationDots steps={steps} />
          </PaginationWrapper.Pagination>
        </PaginationWrapper.Pagination>
      </FormProvider.Wrapper>
    </FormProvider>
  );
};
```

- Example of Pagination component in react native

``` javascript
import React from "react";
import Dot from '../dot/dot';
import {StyleSheet, Text, View} from 'react-native';
import { Button, useTheme } from "react-native-paper";
import Animated from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from "../../utils/theme/theme";
import {  usePagination } from "../multiForm/multiForm";
import { useFormContext } from "react-hook-form";

export const Pagination:React.FC<any> = ( {steps,keyboardStatus,handleSubmit} ):JSX.Element => {
  const { watch} = useFormContext();
  const {canDisplayBackButton,
  handleBack,
  handleNext,
  isLastStep,
  hasErrorByStep,
  isSubmitting} = usePagination({steps,watch,handleSubmit});

  const themes = useTheme<any>();
  const style = styles(themes);

  return (
    <>
    <View style={[style.paginationContainer]}>
      <View>
        {canDisplayBackButton&& <Button
          mode="contained"
          color={themes.colors.primary}
          style={[style.footerButton,keyboardStatus.animatedStyle]}
          onPress={handleBack}
        >
          <Icon name={"arrow-left"} size={20} />
          <Text style={style.footerButtonText}> Previous </Text>
        </Button>
        }
      </View>
      <View>
        <Button
          mode="contained"
          color={themes.colors.primary}
          style={[style.footerButton,keyboardStatus.animatedStyle]}
          onPress={handleNext}
          disabled={hasErrorByStep}
          loading={isSubmitting}
        >
          <Text style={style.footerButtonText}>{isLastStep? 'Submit' :'Next'} </Text>
          {!isLastStep && <Icon name={"arrow-right"} size={20} />}
        </Button>
      </View>
    </View>

    </>
  );
};

export const PaginationDots:React.FC<any> = ({steps}):JSX.Element => {
  const themes = useTheme<any>();
  const style = styles(themes);
  const {currentStep,data} = usePagination({steps});

  return(
    <Animated.View style={[style.dotsContainer]}>
    {data.map((item, index) => {
      return <Dot index={index} currentStep={currentStep} key={index}  totalSteps={data.length}/>;
    })}
  </Animated.View>
  )
}

const styles = (themes:any)=> StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing["8"],
    paddingVertical: theme.spacing["24"],
    elevation:0,
  },
  footerButton: {
    backgroundColor: themes.colors.backgroundSecondary,
    borderRadius: theme.spacing["4"],
    elevation: 0,
    zIndex:0,
  },
  footerButtonText: {
    color: themes.colors.primaryCommon,
    fontSize: theme.fontSize.subHeading,
    fontFamily: theme.fonts.medium.fontFamily,
    fontWeight: theme.fonts.medium.fontWeight as any,
    alignSelf: "center",
  },
  bottomContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginHorizontal: theme.spacing["32"],
    paddingVertical: theme.spacing["24"],
  },
  dotsContainer:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: theme.spacing["12"],
  },
});

```

## Conclusion

In this guide, we've walked through the process of building a multi-page form in React Native using react-hook-form and zod for form handling and validation. By leveraging the power of React's context and reducer patterns, we can efficiently manage the form state across multiple steps, ensuring a smooth user experience.

> > > Happy coding!

_Warning_ : This is a general approach, without so many details, in case of inconsistencies or any question please don't hesitate to contact me!
