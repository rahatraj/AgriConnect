import React from 'react';
import { useTranslation } from 'react-i18next';

const TranslationWrapper = ({ children, translationKey }) => {
  const { t } = useTranslation();

  const translateChildren = (element) => {
    if (typeof element === 'string') {
      return t(element);
    }

    if (!React.isValidElement(element)) {
      return element;
    }

    const childProps = { ...element.props };
    
    // Translate common text props
    ['placeholder', 'title', 'label', 'aria-label'].forEach(prop => {
      if (childProps[prop]) {
        childProps[prop] = t(childProps[prop]);
      }
    });

    // Recursively translate children
    if (element.props.children) {
      childProps.children = React.Children.map(element.props.children, child =>
        translateChildren(child)
      );
    }

    return React.cloneElement(element, childProps);
  };

  return <>{React.Children.map(children, translateChildren)}</>;
};

export default TranslationWrapper; 