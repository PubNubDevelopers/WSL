# Ready-to-Use Prompt Templates for Demo Transformation

## Getting Started Prompts

### 1. Initial Transformation Assessment
```
I want to transform the PubNub Live Events Demo into a [NEW_USE_CASE] demo. 

Current demo: Real-time sports event platform with chat, polls, live stats, reactions, commentary, ads, and gamification.

New vision:
- Industry/Domain: [e.g., "Educational webinars", "Music concerts", "Financial trading"]  
- Target Audience: [e.g., "Students and instructors", "Music fans", "Retail traders"]
- Primary Use Case: [Detailed description of what users will do]
- Key PubNub Features to Highlight: [e.g., "Chat SDK", "Presence", "Functions", "Illuminate"]

Please analyze the existing architecture and create a detailed transformation plan showing:
1. Which widgets can be directly reused
2. Which widgets need adaptation 
3. What new components are required
4. Backend data structure changes needed
5. Estimated development effort for each component
```

### 2. Widget-by-Widget Analysis
```
Let's do a detailed widget analysis for transforming this into a [USE_CASE] demo.

For each existing widget, please tell me:

**ChatWidget**: How would this work for [USE_CASE]? What adaptations are needed?
**StreamWidget**: What type of content would this display? Any new functionality required?
**PollsWidget**: What kinds of polls/surveys make sense for [USE_CASE]?
**MatchStatsWidget**: What live data/metrics should this display instead?
**AdvertsWidget**: What monetization opportunities exist for [USE_CASE]?
**BotWidget**: What automated assistance would be valuable?
**LiveCommentaryWidget**: What kind of commentary/narration fits [USE_CASE]?

For each, provide:
- Reusability score (1-5, 5 = use as-is)
- Required changes (data, UI, functionality)
- New name suggestion
- Implementation complexity (Low/Medium/High)
```

## Component Development Prompts

### 3. Widget Adaptation - Data Schema
```
I need to adapt the [CURRENT_WIDGET] for the [NEW_USE_CASE] demo.

Current data schema: [Paste current interface/type definitions]

New requirements for [NEW_WIDGET_NAME]:
- Display: [What should be shown to users]
- Interactions: [How users interact with it]  
- Real-time updates: [What data changes in real-time]
- Backend integration: [What channels/data sources needed]

Please:
1. Design the new data interfaces/types
2. Show the updated component structure
3. Identify what PubNub channels are needed
4. Create sample data for testing
5. Update the component to use the new schema

Focus on maintaining the real-time capabilities while adapting to the new use case.
```

### 4. Widget Adaptation - UI Design
```
Transform the visual design of [CURRENT_WIDGET] to [NEW_WIDGET] for the [USE_CASE] demo.

Current design: [Describe current appearance]
New requirements:
- Visual style: [e.g., "Professional/corporate", "Fun/colorful", "Minimalist"]
- Color scheme: [Preferred colors]
- Layout changes: [Any structural modifications]
- New interactive elements: [Buttons, inputs, etc.]
- Responsive considerations: [Mobile adaptations]

Please update:
1. Component styling (Tailwind classes)
2. Layout structure if needed
3. Interactive elements
4. Mobile responsiveness  
5. Animation/transition effects

Keep the real-time functionality intact while updating the visual design.
```

### 5. New Widget Creation
```
I need to create a brand new [NEW_WIDGET_NAME] widget for the [USE_CASE] demo.

Requirements:
- Purpose: [What this widget accomplishes]
- Real-time features: [What updates in real-time]
- User interactions: [How users interact with it]
- Data sources: [Where data comes from]
- Integration: [How it connects with other widgets]

Please create:
1. TypeScript interfaces for all data types
2. React component with full functionality
3. PubNub integration for real-time features
4. Responsive design with Tailwind CSS
5. Integration points with existing widgets
6. Sample data for testing

Follow the same patterns as existing widgets in the codebase.
```

## Backend Development Prompts

### 6. Backend Data Generation
```
Update the backend data generator for the [NEW_USE_CASE] demo.

Current system: Simulates a 20-minute sports match with goals, cards, polls, commentary at specific timestamps.

New requirements:
- Event duration: [How long is the new experience]
- Key events: [What happens over time - be specific with timing]
- Interactive moments: [When polls/interactions occur]
- Data types: [What information needs to be tracked]

Please:
1. Create new data files in /backend/game-data/ following existing patterns
2. Update the timeline generation in index.js
3. Modify channel names and message structures  
4. Add any new event types needed
5. Test the timeline with sample data

Maintain the same real-time synchronization capabilities.
```

### 7. Channel Architecture Update
```
Design the PubNub channel architecture for the [NEW_USE_CASE] demo.

Current channels: [List current channel patterns]
New use case requirements: [Describe data flow needs]

Please:
1. Design new channel naming convention
2. Map data types to appropriate channels
3. Consider presence requirements
4. Plan for moderation needs
5. Update all channel references in the codebase
6. Ensure proper channel permissions

Show me the complete channel mapping and update all relevant files.
```

## Visual Design & Branding Prompts

### 8. Complete Visual Redesign  
```
Redesign the entire demo for [NEW_USE_CASE] with [BRAND_STYLE] aesthetic.

Design requirements:
- Color palette: [Primary and secondary colors]
- Typography: [Font preferences and hierarchy]
- Imagery style: [Type of images/graphics needed]
- Layout preferences: [Any structural changes]
- Brand personality: [Professional, playful, modern, etc.]

Please update:
1. Global CSS color variables and themes
2. Component styling throughout the app
3. Replace placeholder images with appropriate alternatives
4. Update typography and spacing
5. Ensure responsive design is maintained
6. Update any logos or branding elements

Create a cohesive visual identity that matches the new use case.
```

### 9. Asset Replacement
```
I need to replace all visual assets for the [NEW_USE_CASE] demo.

Current assets in /web/public/:
- Sports-related images and icons
- Team badges and player photos  
- Generic placeholder avatars
- Brand-specific graphics

New requirements:
- Theme: [New visual theme]
- Asset types needed: [Describe what images/icons you need]
- Style preferences: [Photographic, illustrated, minimalist, etc.]

Please:
1. Identify all assets that need replacement
2. Suggest appropriate alternatives (describe what to look for)
3. Update all asset references in the codebase
4. Ensure proper image optimization
5. Maintain responsive image handling

Focus on assets that support the new use case narrative.
```

## Testing & Validation Prompts

### 10. Feature Testing
```
Let's test the transformed [NEW_USE_CASE] demo thoroughly.

Please verify:
1. All widgets load and function correctly
2. Real-time data flows work as expected  
3. User interactions trigger appropriate responses
4. Cross-device compatibility (mobile/tablet/desktop)
5. PubNub features are properly integrated
6. Error handling works correctly

For any issues found:
- Describe the problem clearly
- Identify the root cause
- Provide a fix
- Test the fix

Run through realistic user scenarios and edge cases.
```

### 11. Performance Optimization
```
Optimize the [NEW_USE_CASE] demo for performance and scalability.

Please analyze and optimize:
1. React rendering performance
2. PubNub message handling efficiency
3. Memory usage in long sessions
4. Network request optimization
5. Image loading and caching
6. Bundle size optimization

For each area:
- Identify current performance characteristics
- Suggest specific improvements
- Implement optimizations
- Measure improvement impact

Focus on maintaining smooth real-time updates even with high user engagement.
```

## Completion & Polish Prompts  

### 12. Demo Data & Content
```
Create engaging, realistic demo data for the [NEW_USE_CASE] demo.

Please generate:
1. Realistic user profiles and avatars
2. Believable chat conversations
3. Appropriate poll questions and options
4. Sample data for all widgets
5. Timeline events that tell a compelling story
6. Bot responses that add value

The demo should:
- Feel authentic and engaging
- Showcase all key features naturally
- Work well for sales demonstrations
- Include variety to keep demonstrations interesting

Make the demo data compelling enough that prospects want to build something similar.
```

### 13. Documentation & Handoff
```
Create complete documentation for the [NEW_USE_CASE] demo.

Please generate:
1. Updated README with setup instructions
2. Feature overview highlighting PubNub capabilities
3. Architecture documentation
4. Deployment guide
5. Troubleshooting common issues
6. Demo script for sales presentations

Include:
- Clear value proposition for the new use case
- Technical benefits of using PubNub
- Scalability and performance characteristics
- Integration examples and next steps

The documentation should enable someone else to understand, deploy, and demonstrate the solution effectively.
```

## Usage Guidelines

### How to Use These Prompts

1. **Copy the relevant template** for your current development phase
2. **Fill in the bracketed placeholders** with your specific requirements
3. **Add any additional context** specific to your situation  
4. **Run the prompt** and iterate based on the results

### Template Customization

Feel free to:
- Combine multiple templates for complex tasks
- Add specific technical requirements
- Include examples from your target industry
- Reference specific PubNub features you want to highlight

### Best Practices

- **Be specific** in your requirements - vague prompts lead to vague results
- **Provide context** about your target audience and goals
- **Break large tasks** into smaller, focused prompts
- **Test incrementally** rather than trying to transform everything at once
- **Iterate based on results** - use follow-up prompts to refine the output

These templates will help you efficiently transform the demo while maintaining the robust architecture and PubNub integrations that make it valuable.
