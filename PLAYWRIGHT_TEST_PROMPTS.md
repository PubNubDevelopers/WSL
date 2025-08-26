# WSL Playwright Testing - Executable Prompts

## Quick Start Testing Sequence

Execute these prompts one by one to test the WSL application systematically.

---

## 🏃‍♂️ Phase 1: Core Functionality Tests

### Test 1: Application Launch and Basic Navigation
**Prompt for Playwright:**
```
Navigate to http://localhost:3000 and test the basic application flow:

1. Take a screenshot of the initial page
2. Click through the sales intro page (if present) 
3. Select a user from the login page (choose "Maya Rodriguez" or first available)
4. Wait for authentication to complete
5. Verify the main sports event page loads
6. Test switching between tablet and mobile preview modes
7. Take screenshots of both preview modes
8. Test opening and closing the side menu
```

### Test 2: Heat Lounge Chat Functionality  
**Prompt for Playwright:**
```
Test the core chat features in the Heat Lounge:

1. Locate and click on the Heat Lounge chat widget
2. Send a test message: "Testing real-time chat 🤙"
3. Wait 2 seconds and verify the message appears
4. Test emoji reactions by clicking available emoji buttons
5. Check the online presence counter updates
6. Test the language toggle buttons (EN, PT, ES)
7. Take a screenshot of the chat interface with messages
```

### Test 3: Stream and Reactions
**Prompt for Playwright:**
```
Test the video stream and reaction system:

1. Locate the video stream widget
2. Click the play button and verify video loads
3. Test stream reaction buttons (🤙, 🌊, 🔥)  
4. Verify reaction counts appear and update
5. Take screenshot of the stream interface with reactions
6. Test stream presence tracking
```

---

## 🎯 Phase 2: Interactive Features Tests

### Test 4: Fantasy Live Features
**Prompt for Playwright:**
```
Test the fantasy scoring system:

1. Navigate to or locate the Fantasy Live widget
2. Verify surfer information displays (Griffin Colapinto, John John Florence)
3. Look for Power Surfer indicators and multipliers
4. Check for score updates and leaderboard
5. Take screenshot of fantasy interface
6. Test any interactive fantasy elements
```

### Test 5: Polls and Prop Predictions
**Prompt for Playwright:**
```
Test the polling and prediction system:

1. Look for active polls or prop predictions
2. If available, participate in a poll by voting
3. Verify vote submission and real-time results
4. Check for rapid prediction polls ("Will this wave score 8+?")
5. Test prediction streak tracking if visible
6. Take screenshot of polling interface
```

### Test 6: Advanced Feature Discovery
**Prompt for Playwright:**
```
Explore and test advanced features:

1. Look for clip creation button ("Clip Last 30s")
2. Test creating a clip if available
3. Find and test co-watch party features
4. Check for athlete AMA rooms or athlete interactions
5. Test any advertisement clicking for points
6. Explore side menu options and data controls
```

---

## 📱 Phase 3: Responsive and Performance Tests

### Test 7: Mobile Responsiveness
**Prompt for Playwright:**
```
Test mobile device compatibility:

1. Set viewport to mobile size (375x667)
2. Navigate through all major features in mobile view
3. Test touch interactions on chat and buttons
4. Verify mobile-specific UI adaptations
5. Test mobile keyboard interaction with chat input
6. Take screenshots of key mobile interfaces
```

### Test 8: Cross-Browser Testing
**Prompt for Playwright:**
```
Test functionality in different browsers:

1. Repeat core tests in Firefox browser
2. Test the same functionality in WebKit/Safari
3. Compare performance and functionality across browsers
4. Document any browser-specific issues
5. Verify consistent visual appearance
```

---

## 🔍 Phase 4: Edge Cases and Error Handling

### Test 9: Network and Error Conditions
**Prompt for Playwright:**
```
Test error handling and edge cases:

1. Test with throttled network connection
2. Try sending empty messages or invalid inputs
3. Test rapid message sending (spam protection)
4. Refresh page during active chat session
5. Test behavior when offline/online
6. Verify error messages are helpful and clear
```

### Test 10: Data Persistence and Sync
**Prompt for Playwright:**
```
Test data synchronization:

1. Open application in a second browser window/tab
2. Send messages from one window, verify they appear in both
3. Test presence updates across windows
4. Verify score updates sync across instances  
5. Test logout and re-login data persistence
6. Check message history after page refresh
```

---

## 🧪 Phase 5: Production Feature Testing

### Test 11: Translation and Multi-language
**Prompt for Playwright:**
```
Test translation capabilities:

1. Switch language to Portuguese (PT)
2. Send messages that should trigger translation
3. Toggle translation display on/off
4. Test translation confidence indicators
5. Verify language-specific UI adaptations
6. Test returning to English (EN) mode
```

### Test 12: Real-time Performance Testing
**Prompt for Playwright:**
```
Test real-time performance:

1. Measure message delivery time (should be <100ms)
2. Test with rapid interactions (multiple reactions, messages)
3. Monitor for memory leaks during extended use
4. Test concurrent feature usage (chat + polls + fantasy)
5. Verify performance during high activity
6. Document any performance issues
```

---

## 📊 Execution Instructions

### Setup Commands
```bash
# Navigate to web directory
cd /Users/joshua/ViberCoded/WSL/web

# Start the application
npm run dev

# In another terminal, start backend (optional)
cd /Users/joshua/ViberCoded/WSL/backend  
npm run generator
```

### Using Playwright MCP
For each test, use these Playwright MCP commands:

1. **Navigate**: `playwright_navigate` with URL
2. **Screenshots**: `playwright_screenshot` for documentation
3. **Interactions**: `playwright_click`, `playwright_fill` for user actions
4. **Verification**: `playwright_get_visible_text` to check content
5. **Network**: Use network throttling options for performance tests

### Expected Results Documentation

For each test, record:
- ✅ **PASS**: Feature works as expected
- ❌ **FAIL**: Issue encountered (with screenshot)
- ⚠️ **SLOW**: Performance concern (>3 second response)
- 💡 **NOTE**: Observation or improvement suggestion

### Critical Success Metrics
- **Chat messages**: Appear within 2 seconds
- **User authentication**: Completes successfully  
- **Stream reactions**: Update in real-time
- **Mobile experience**: Fully functional
- **No console errors**: Clean JavaScript execution
- **Visual consistency**: Matches surf/WSL branding

### Immediate Action Items
1. Start with Tests 1-3 for core functionality validation
2. Document any critical issues immediately
3. Progress to interactive features (Tests 4-6)
4. Complete responsive testing (Tests 7-8)
5. Finish with edge cases and performance (Tests 9-12)

This testing sequence provides immediate actionable validation of the WSL application's core functionality and real-time features.
