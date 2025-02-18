# AI Chatbot Library

This library provides a fully customizable and accessible AI chatbot UI component suite. It includes features like theming, chat history, accessibility options, and a real-time chat interface.

---

## Storybook

To start Storybook for the library, use the following command:

```bash
npm run storybook
```


## File Structure

```
src/
├── components/
│   ├── ChatBox/
│   ├── HistoryBox/
│   ├── Header/
│   ├── Accessibility/
│   ├── Switch/
│   └── ...
├── assets/
│   ├── plus.svg
│   ├── messageIcon.svg
│   ├── searchIcon.svg
│   ├── collapsedLogo.png
│   └── ...
├── themeContext/
│   ├── themeProvider.tsx
│   └── ...
├── stories/
│   └── ...
└── index.ts
```

## Usage

### Full Chatbot Integration

To use the complete chatbot suite in your application, import and render the `ChatbotSuite` component.

```tsx
import React from "react";
import FullChatbot from "your-library-name"; // Replace 'your-library-name' with the actual name of the library

const App: React.FC = () => {
  const handleChatSubmit = (message: string) => {
    console.log("New message submitted:", message);
  };

  const handleCardClick = (cardDetails: any) => {
    console.log("Chat card clicked:", cardDetails);
  };

  return (
    <div style={{ height: "100vh" }}>
      <FullChatbot
        history={[
          { title: "Chat 1", timeStamps: new Date(), isActive: true },
          { title: "Chat 2", timeStamps: new Date(), isActive: false },
        ]}
        chats={[]}
        onChatSubmit={handleChatSubmit}
        onCardClick={handleCardClick}
        onScroll={() => console.log("Scrolled")}
        onScrollTop={() => console.log("Scrolled to top")}
        onScrollBottom={() => console.log("Scrolled to bottom")}
        onSearchChange={(term) => console.log("Search term:", term)}
        onFileUpload={(file) => console.log("File uploaded:", file)}
        onCreateNewChat={() => console.log("New chat created")}
        isToggleChecked={false}
      />
    </div>
  );
};

export default App;
```

## Build

### Building the Library

To build the library for production, use the following command:

```bash
npm run build
```


