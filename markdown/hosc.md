# My High Order Style Component system


> ~5mins reading -
>4/8/2024  


**Atomic design** is a methodology for creating design systems. It was introduced by Brad Frost and is based on the concept of breaking down a design into its smallest parts and building up from there. The methodology consists of five distinct levels:
1. Atoms
 Atoms are the basic building blocks of matter. In the context of web design, atoms are the basic HTML elements like buttons, inputs, labels, etc. They are the smallest unit and cannot be broken down further.

2. Molecules
   Molecules are groups of atoms bonded together and are the smallest fundamental units of a compound. In web design, molecules are simple groups of UI elements functioning together as a unit.

3. Organisms
   Organisms are groups of molecules joined together to form a relatively complex, distinct section of an interface. These can include headers, footers, or any other section that combines multiple molecules.

4. Templates
   Templates are groups of organisms stitched together to form pages. They provide context for the layout and structure of the design but do not contain any real content.

5. Pages
   Pages are specific instances of templates that show what a UI looks like with real content in place. They are the most concrete and tangible level of the design system.

For sure, Atomic Design is a powerful methodology for creating robust and scalable design systems. By breaking down the design into smaller, reusable components, it ensures consistency and maintainability across the entire application.


 ___

When I first started working on different projects of the same company, we were creating components for  the UI library based on this pattern, which could be used by themselves in different projects and environments, but I always felt that something was missing. Different libraries like Bootstrap, are a goodfit for your project to build,  customize with Sass, utilize prebuilt grid system and components , but I think that tools are useful only if we use it in the right way. Each projects may use the same UI components and style system, but the UX may change by time to time.
> Questions like how much space should have the form from the top of the page or how much space should have the footer buttons of modal from the content etc, makes me think of HOSC.

# Using High Order Style Components (HOSC)
High Order Style Components (HOSC) are a pattern in React that allows you to reuse style logic across multiple components. They are similar to Higher-Order Components (HOC) but focus on styling.

An example with sass and pure JSX components, could be:

### Example 

Inside a _utilits.scss file all the basic and standard variables

*Variables*

```scss 
$largeSize: 30px;
$mediumSize: 20px;
$regularSize: 10px;
$smallSize: 5px;

```
*CSS Classes*

```css
.content-margin-top {
  margin-top: $mediumSize;
}
.content-section-margin-top {
  margin-top: $regularSize;
}

.content-margin-bottom {
  margin-bottom: $mediumSize;
}

.content-marginTop-paddingLeft {
  margin-top: $mediumSize;
  padding-left: $mediumSize;
}

.small-modal-primary {
  margin: 0 $regularSize 0 0;
  float: right;
}

.small-modal-secondary {
  margin-top: $smallSize;
  float: right;
}

.small-modal-primary-reserve {
  margin-top: $regularSize;
  margin-right: $regularSize;
  float: right;
}

```

*Components*

```javascript
export const SmallModal = (props: { children: React.ReactNode; }): JSX.Element => {
    return (
        <>
            <div className={`row ${generalStyles['content-margin-top-small-modal']}`}>
                <div className="col-sm-12">
                    {props.children}
                </div>
            </div>

        </>
    );
};
export const LargeModal = (props: { children: React.ReactNode; }): JSX.Element => {
    return (
        <>
            <div className='row'>
                <div className={'col-sm-12'}>
                    <div className={'col-sm-9 col-sm-offset-3'}>
                        {props.children}
                    </div>
                </div>
            </div>
        </>
    );
};

export const ButtonRelatedToRows= (props: { children: React.ReactNode; }): JSX.Element => {
    return (
        <div className={generalStyles['button-inline-block']}>
            {props.children}
        </div>
    );
};

export const PrimaryButton = (props: { children: React.ReactNode; }): JSX.Element => {
    return (
        <>
            <div className={generalStyles['small-modal-primary']}>
                {props.children}
            </div>
        </>
    );
};

export const SecondaryButton = (props: { children: React.ReactNode; }): JSX.Element => {
    return (
        <div className={generalStyles['small-modal-secondary']}>
            {props.children}
        </div>
    );
};

export const TertiaryButton = (props: { children: React.ReactNode}): JSX.Element => {
    return (
        <div className={'container'}>
            <div className={'row'}>
                <div className={'col-sm-12'}>
                    <div className={'col-sm-2 col-sm-offset-2'} >
                        {props.children}
                    </div>
                </div>
            </div>
        </div>
    );
};


export const PrimaryButtonReserve = (props: { children: React.ReactNode; }): JSX.Element => {
    return (
        <div className={generalStyles['small-modal-primary-reserve']}>
            {props.children}
        </div>
    );
}

export const SecondaryButtonReverse = (props: { children: React.ReactNode; }): JSX.Element => {
    return (
        <div className={generalStyles['small-modal-secondary-reverse']}>
            {props.children}
        </div>
    );
};


export const TabWrapper = (props:{  children?: JSX.Element   }): JSX.Element => {
    return (
        <>
            <div className="row">
                <div className={'col-sm-12'}>
                    {props.children}
                </div>
            </div>
        </>
    );
};

export const TabButton = (props:{  children?: JSX.Element }): JSX.Element => {
    return (
        <>
            <div className={generalStyles['tab-button']}>
                {props.children}
            </div>
        </>
    );
};
export const GroupElements = (props: { children: React.ReactNode, style:string }): JSX.Element => {
    return (
        <>
            <div className='row'>
                <div className={'col-sm-12'}>
                    <div className={props.style}>
                        {props.children}
                    </div>
                </div>
            </div>
        </>
    );
};

```

The above examples demostrate a combination of Bootrap, Scss and Typescript  components.
The same logic could apply well with Styled-Components, Emotion etc.

### Benefits

+ Reusability: You can apply the same styles to multiple components without duplicating code.
+ Separation of Concerns: Styling logic is separated from the component logic, making the code easier to maintain.
+ Consistency: Ensures consistent styling across different components.
+ Simplicity.


### Final thoughts
High Order Style Components helped me to  manage styles in different React applications. By abstracting style logic into reusable functions, you can create more maintainable and consistent code.



> > > Have a good one!




