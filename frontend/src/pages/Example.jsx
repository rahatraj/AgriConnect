import React from 'react';
import { usePageTranslation } from '../hooks/usePageTranslation';
import TranslationWrapper from '../components/common/TranslationWrapper';
import { TRANSLATION_KEYS } from '../utils/translationKeys';

const Example = () => {
  // 1. Using the custom hook approach
  const { tp, tc } = usePageTranslation('home');

  return (
    <div className="p-4">
      {/* 1. Using the custom hook - Most convenient for pages */}
      <div className="mb-8">
        <h1>{tp('title')}</h1>
        <p>{tp('welcome')}</p>
        <button className="btn btn-primary">
          {tc('buttons', 'save')}
        </button>
      </div>

      {/* 2. Using TranslationWrapper - Good for components with lots of text */}
      <TranslationWrapper>
        <div className="mb-8">
          <h2>pages.home.section_title</h2>
          <p>pages.home.section_description</p>
          <input 
            type="text" 
            placeholder="common.placeholders.search"
            className="input input-bordered" 
          />
        </div>
      </TranslationWrapper>

      {/* 3. Using TRANSLATION_KEYS - Good for maintaining consistency */}
      <div className="mb-8">
        <h2>{tc('labels', TRANSLATION_KEYS.common.labels.email)}</h2>
        <input 
          type="email" 
          placeholder={tc('placeholders', TRANSLATION_KEYS.common.placeholders.email)}
          className="input input-bordered"
        />
      </div>
    </div>
  );
};

export default Example; 