import React, { useState, useEffect, useRef } from 'react';

const timeLogs = {};

const getCurrentTime = () => new Date().getTime(); // Returns the current time in milliseconds

const logTime = (questionId) => {
  timeLogs[questionId] = getCurrentTime();
};

const getTimeDifference = (id1, id2) => {
  if (timeLogs[id1] && timeLogs[id2]) {
    return (timeLogs[id2] - timeLogs[id1]) / (1000 * 60 * 60); // Difference in hours
  }
  return 0;
};

const handleNextQuestion = (currentId) => {
  const timeDiff = getTimeDifference(5, 48);
  if (timeDiff <= 24) {
    // Skip questions from 49 to 61 and go to 62
    return 62;
  }
  return chatFlow.en.find((q) => q.id === currentId)?.options[0]?.nextId || null;
};

const App = () => {
  const [currentQuestionId, setCurrentQuestionId] = useState(1);
  const [textSize, setTextSize] = useState(16);
  const [chatHistory, setChatHistory] = useState([]);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [language, setLanguage] = useState('en'); // Default language
  const [userResponses, setUserResponses] = useState({});
  const [userInput, setUserInput] = useState('');
  const [waitingForInput, setWaitingForInput] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [volume, setVolume] = useState(1); // Volume range: 0 to 1
  const [speed, setSpeed] = useState(1); // Speed range: 0.1 to 10
  const [responses, setResponses] = useState({});
  const [isTextInputVisible, setIsTextInputVisible] = useState(false);
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  const chatWindowRef = useRef(null);

  const handleAnswer = (questionId, answer) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [questionId]: parseInt(answer),
    }));
    let nextId = getNextQuestionId(questionId, answer);
    setCurrentQuestionId(nextId);
  };

  const getNextQuestionId = (questionId, answer) => {
    if (questionId === 5 || questionId === 6) {
      const response5 = responses[5];
      const response6 = responses[6];
      if (response5 !== undefined && response6 !== undefined) {
        const cumulativeValue = response5 + response6;
        return cumulativeValue < 2 ? 7 : 10;
      }
    }

    // Handle questions 10 through 18 redirection
    if (questionId >= 10 && questionId <= 18) {
      const allAnswered = Object.keys(responses).length >= 9; // IDs 10 through 18
      if (allAnswered) {
        const values = Object.values(responses).filter((value) => !isNaN(value));
        const cumulativeValue = values.reduce((sum, value) => sum + value, 0);
        return cumulativeValue < 2 ? 7 : 19;
      }
    }

    // Default nextId if no special condition applies
    return (
      chatFlow.en.find((q) => q.id === questionId)?.options.find((option) => option.text === answer)?.nextId || questionId
    );
  };

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);

      const femaleVoice = availableVoices.find((voice) => voice.name.toLowerCase().includes('female'));
      if (!selectedVoice) {
        setSelectedVoice(femaleVoice || availableVoices[0]);
      }
    };

    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;

    if (chatHistory.length > 0 && isVoiceEnabled) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      readOutLoud(lastMessage.text);
    }
  }, [chatHistory, isVoiceEnabled]);

  useEffect(() => {
    if (selectedVoice) {
      readOutLoud(chatHistory.map((entry) => entry.text).flat());
    }
  }, [selectedVoice, volume, speed]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const readOutLoud = (texts) => {
    if ('speechSynthesis' in window && selectedVoice) {
      const textArray = Array.isArray(texts) ? texts : [texts];
      textArray.forEach((text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.rate = speed; // Use the speed setting
        utterance.pitch = 1.1; // You can also add a state for pitch if needed
        utterance.volume = volume; // Use the volume setting

        window.speechSynthesis.speak(utterance);
      });
    }
  };

  const handleOptionClick = (nextId, optionText) => {
    setCurrentQuestionId(nextId);

    handleUserResponse(currentQuestionId, parseInt(optionText, 10));

    // Determine the next step based on the values
    const value5 = userResponses[5] || 0;
    const value6 = userResponses[6] || 0;
    const cumulativeValue = value5 + (parseInt(optionText, 10) || 0);

    if (currentQuestionId === 5) {
      // Move to question 6 after question 5
      setChatHistory([
        ...chatHistory,
        {
          text: chatFlow[language].find((step) => step.id === 6).text,
          options: chatFlow[language].find((step) => step.id === 6).options,
        },
      ]);
      setCurrentQuestionId(6);
      setWaitingForInput(true);
    } else if (currentQuestionId === 6) {
      // Determine next step based on cumulative value
      const nextStep = cumulativeValue < 2 ? 7 : 10;
      setChatHistory([
        ...chatHistory,
        {
          text: chatFlow[language].find((step) => step.id === nextStep).text,
          options: chatFlow[language].find((step) => step.id === nextStep).options,
        },
      ]);
      setCurrentQuestionId(nextStep);
      setWaitingForInput(nextStep === 6);
      setSelectedOption(optionText);
    } else {
      // For other steps, proceed with the default behavior
      const nextStep = chatFlow[language].find((step) => step.id === nextId);
      setChatHistory([
        ...chatHistory,
        { text: nextStep.text, options: nextStep.options },
      ]);
      setCurrentQuestionId(nextId);
      setWaitingForInput(nextId === 6);
      setSelectedOption(optionText);

      // Show input text window for specific IDs
      if ([74, 76, 78, 80].includes(nextId)) {
        setIsTextInputVisible(true);
        setWaitingForInput(true);
      } else {
        setIsTextInputVisible(false);
        setWaitingForInput(false);
      }
    }
  };

  const handleUserResponse = (questionId, response) => {
    setUserResponses((prevResponses) => ({
      ...prevResponses,
      [questionId]: response,
    }));
  };

  const handleUserInput = () => {
    if (userInput.trim()) {
      handleUserResponse(currentQuestionId, userInput);
      setChatHistory([
        ...chatHistory,
        { text: userInput, options: [] },
      ]);
      setUserInput('');
      setWaitingForInput(false);
      setIsTextInputVisible(false);
      const nextId = currentQuestionId + 1;
      setCurrentQuestionId(nextId); // Proceed to next question
      const nextQuestion = chatFlow.en.find((q) => q.id === nextId);
      if (nextQuestion) {
        setChatHistory([
          ...chatHistory,
          { text: nextQuestion.text, options: nextQuestion.options },
        ]);
      }
    }
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const currentQuestion = chatFlow.en.find((q) => q.id === currentQuestionId);

  return (
    <div
      style={{
        maxWidth: '600px', // Limit maximum width for larger screens
        width: '90%', // Take 90% of the viewport width for smaller screens
        margin: '0 auto',
        padding: '20px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Helvetica Neue, Arial, sans-serif',
        height: '100vh', // Full height for better mobile experience
        overflow: 'hidden', // Prevent overflow
      }}
    >
      <h2 style={{ color: '#656AFF' }}>nurtur</h2>

      

      {/* Panel Toggle */}
      <button
        onClick={() => setIsPanelVisible((prev) => !prev)}
        style={{
          marginBottom: '10px',
          borderRadius: '4px',
          padding: '10px',
          background: '#656AFF',
          color: '#fff',
          cursor: 'pointer',
          fontFamily: 'Helvetica Neue, Arial, sans-serif',
        }}
      >
        {isPanelVisible ? 'Hide Panel' : 'Show Panel'}
      </button>

      {isPanelVisible && (
        <div
          style={{
            marginBottom: '20px',
            width: '100%',
            background: '#f0f0f0',
            padding: '10px',
            borderRadius: '8px',
          }}
        >
          {/* Voice Toggle */}
          <div style={{ marginBottom: '10px' }}>
            <label>
              Enable Voice:
              <input
                type="checkbox"
                checked={isVoiceEnabled}
                onChange={() => setIsVoiceEnabled((prev) => !prev)}
              />
            </label>
          </div>

          {/* Language Selection */}
          <div style={{ marginBottom: '10px' }}>
            <label>
              Select Language:
              <select
                onChange={(e) => setLanguage(e.target.value)}
                value={language}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="zh-TW">繁體中文</option>
                {/* Added Traditional Chinese option */}
              </select>
            </label>
          </div>

          {/* Voice Selection */}
          {isVoiceEnabled && (
            <div style={{ marginBottom: '10px' }}>
              <label>
                Select Voice:
                <select
                  onChange={(e) =>
                    setSelectedVoice(voices.find((voice) => voice.name === e.target.value))
                  }
                  value={selectedVoice ? selectedVoice.name : ''}
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {/* Volume Control */}
          <div style={{ marginBottom: '10px' }}>
            <label>
              Volume:
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{ marginLeft: '10px' }}
              />
              {volume}
            </label>
          </div>

          {/* Speech Speed Control */}
          <div style={{ marginBottom: '10px' }}>
            <label>
              Speech Speed:
              <select
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                value={speed}
              >
                <option value="0.1">0.1x</option>
                <option value="0.5">0.5x</option>
                <option value="0.8">0.8x</option>
                <option value="0.9">0.9x</option>
                <option value="1">1x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
                <option value="3">3x</option>
                <option value="4">4x</option>
                <option value="5">5x</option>
                <option value="6">6x</option>
                <option value="7">7x</option>
                <option value="8">8x</option>
                <option value="9">9x</option>
                <option value="10">10x</option>
              </select>
            </label>
          </div>

          {/* Text Size Control */}
          <div style={{ marginBottom: '10px' }}>
            <button onClick={() => setTextSize((prevSize) => prevSize + 2)}>Increase Text Size</button>
            <button onClick={() => setTextSize((prevSize) => Math.max(prevSize - 2, 10))}>
              Decrease Text Size
            </button>
          </div>
        </div>
      )}

      <div
        ref={chatWindowRef}
        style={{
          width: '100%',
          flex: 1,
          display: 'flex',
          border: '1px solid #ccc',
          borderRadius: '8px',
          overflowY: 'auto',
          padding: '10px',
          backgroundColor: '#D0D5FF',
        }}
      >
        {/* Chatbot Text Area */}
        <div style={{ flex: 1, padding: '10px', backgroundColor: '#D0D5FF', borderRadius: '8px' }}>
          {chatHistory.map((entry, index) => (
            <div key={index} style={{ marginBottom: '40px' }}>
              {' '}
              {/* Increased gap size */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px',
                  fontFamily: 'Helvetica Neue, Arial, sans-serif',
                  fontSize: `${textSize}px`,
                }}
              >
                {(Array.isArray(entry.text) ? entry.text : [entry.text]).map((line, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: line }}></p>
                ))}
              </div>
              {entry.options && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {entry.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(option.nextId, option.text)}
                      style={{
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        padding: '8px',
                        background: '#656AFF',
                        color: '#fff',
                        cursor: 'pointer',
                        fontFamily: 'Helvetica Neue, Arial, sans-serif',
                        flex: '1 1 auto',
                      }}
                    >
                      {option.text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Input Area */}
        {isTextInputVisible && (
          <div style={{ flex: 1, padding: '10px' }}>
            <div
              style={{
                background: '#D0D5FF',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '10px',
                height: '100%',
                fontFamily: 'Helvetica Neue, Arial, sans-serif',
              }}
            >
              <input
                type="text"
                value={userInput}
                onChange={handleInputChange}
                placeholder="Type your response here..."
                style={{
                  width: '100%',
                  padding: '8px',
                  marginBottom: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: '#E6E9FF',
                  fontFamily: 'Helvetica Neue, Arial, sans-serif',
                }}
              />
              <button
                onClick={handleUserInput}
                style={{
                  display: 'block',
                  width: '100%',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  padding: '8px',
                  background: '#656AFF',
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'Helvetica Neue, Arial, sans-serif',
                }}
              >
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      {currentQuestionId === 1 && (
        <div style={{ marginTop: '10px' }}>
          <button onClick={() => handleOptionClick(1)}>Start Chat</button>
        </div>
      )}
    </div>
  );
};

export default App;




// Define the chatbot flow with multiple languages
const chatFlow = {
  en: [
    {
      id: 1,
      text: [
        'Hello, I’m Nayomi.',
        'Welcome to the nurtur platform! We understand the unique challenges that come with being a mom-to-be and our platform is designed to support you through your pregnancy journey by providing a clinically proven protocol tailored to your needs.',
      ],
      options: [
        { text: 'Next', nextId: 2 }
      ],
    },
    {
      id: 2,
      text: 'By completing all the modules, you’ll be equipped with valuable insights and tools to navigate the complexities of the postpartum period with greater ease. Our program is based on a protocol proven to prevent postpartum depression by up to 53%.',
      options: [
        { text: 'Next', nextId: 3 }
      ],
    },
    {
      id: 3,
      text: 'Your well-being is our priority, so please don’t hesitate to reach out if you have any questions or need further assistance along the way. Let’s embark on this journey together and empower you to prioritize self-care while nurturing your growing family.',
      options: [
        { text: 'Next', nextId: 4 }
      ],
    },
    {
      id: 4,
      text: 'Let me know when you’re ready to get started.',
      options: [{ text: 'Next', nextId: 5 }],
    },
    {
      id: 5,
      text: [
        'Before we start today’s session, please let me ask a couple of questions to help me better understand how to better help you with any issues.',
        'Over the last 24 hours, how often have you been bothered by having little interest or pleasure in doing things?',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 6 },{ text: '1', nextId: 6 },{ text: '2', nextId: 6 },{ text: '3', nextId: 6 }],
    },
        {
      id: 6,
      text: [
        'Over the last 24 hours, how often have you been bothered by feeling down, depressed, or hopeless?',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 7 },{ text: '1', nextId: 7 },{ text: '2', nextId: 7 },{ text: '3', nextId: 7 }],
    },
                    {
    id: 10,
      text: [
        'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
        'Little interest or pleasure in doing things? On a scale of 0 to 3:',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 11 },{ text: '1', nextId: 11 },{ text: '2', nextId: 11 },{ text: '3', nextId: 11 }],
    },
                        {
    id: 11,
      text: [
        'Feeling down, depressed, or hopeless? On a scale of 0 to 3:',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 12 },{ text: '1', nextId: 12 },{ text: '2', nextId: 12 },{ text: '3', nextId: 12 }],
    },                        {
    id: 12,
      text: [
        'Trouble falling or staying asleep, or sleeping too much? On a scale of 0 to 3:',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 13 },{ text: '1', nextId: 13 },{ text: '2', nextId: 13 },{ text: '3', nextId: 13 }],
    },
    {
    id: 13,
      text: [
        'Feeling tired or having little energy? On a scale of 0 to 3:',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 14 },{ text: '1', nextId: 14 },{ text: '2', nextId: 14 },{ text: '3', nextId: 14 }],
    },
    {
    id: 14,
      text: [
        'Poor appetite or overeating? On a scale of 0 to 3:',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 15 },{ text: '1', nextId: 15 },{ text: '2', nextId: 15 },{ text: '3', nextId: 15 }],
    },
    {
    id: 15,
      text: [
        'Feeling bad about yourself or that you are a failure or have let yourself or your family down? On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 16 },{ text: '1', nextId: 16 },{ text: '2', nextId: 16 },{ text: '3', nextId: 16 }],
    },  
    {
    id: 16,
      text: [
        'Trouble concentrating on things, such as reading the newspaper or watching television? On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 17 },{ text: '1', nextId: 17 },{ text: '2', nextId: 17 },{ text: '3', nextId: 17 }],
    },
    {
    id: 17,
      text: [
        'Moving or speaking so slowly that other people could have noticed. Or the opposite being so figety or restless that you have been moving around a lot more than usual? On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 18 },{ text: '1', nextId: 18 },{ text: '2', nextId: 18 },{ text: '3', nextId: 18 }],
    },
    {
    id: 18,
      text: [
        'Thoughts that you would be better off dead, or of hurting yourself? On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 19 },{ text: '1', nextId: 19 },{ text: '2', nextId: 19 },{ text: '3', nextId: 19 }],
    },
    {
    id: 19,
      text: [
        'The survey has detected high levels of stress. Please know that help is here for you. Call or text the National Maternal Mental Health Hotline at 1-833-TLC-MAMA (1-833-852-6262) before continuing with the session.'
      ],
      options: [{ text: 'OK', nextId: 47 }],
    },
      {
    id: 47,
      text: [
        'Have you contacted the listed phone number?'
      ],
      options: [{ text: 'Yes', nextId: 7 },{ text: 'No', nextId: 19 }],
    },


    
            {
      id: 7,
      text: [
        'Thank you. Let’s get started with today’s session.',
        'Hello, I’m Nayomi, your virtual prenatal educator here. Congratulations on your pregnancy!',
      ],
      options: [{ text: 'Yes', nextId: 8 }],
    },
                {
    id: 8,
      text: [
        'I’m here to support you through the ROSE Program, which stands for Reaching Out to Social Support and Education. It’s a series of sessions designed to teach you skills to manage stress, especially after your baby arrives.',
      ],
      options: [{ text: 'OK', nextId: 20 }],
    },
{id:20,text: ['Having a baby is a joyful time, but it can also bring new challenges. We want to help you get a good start for your baby and yourself. It may be helpful to set aside a specific time every day to complete these sessions.',
'Before we begin, please limit any distractions to stay focused. On average, each session will take between 10 to 15 minutes so you can plan accordingly.',],
options:[{text: 'OK', nextId: 21 }],},    
{
  id:21,text:[ 'Select next when you’re ready to continue.',],options:[{text: 'NEXT', nextId: 22 }],},

{id:22,text: ['Women are not all the same. Some women are overjoyed at having a baby and will say they have never been happier. Others may have mixed feelings- at times they feel “so happy’” and at other times “so overwhelmed.” And for some women it is very stressful. However, no-one talks about how hard it can be - the changes you will need to make and that becoming a parent can be one of the hardest jobs in your life - a job that comes with very little training.',],
options:[{text: 'Next', nextId: 23}],},

{id:23,text: ['If you think about it realistically - you have to put your own needs aside, you have to feed, rock, change diapers, clothes, not to mention the regular chores of a home - plus all your other roles as a partner, daughter, friend, worker. All this while you are exhausted from sleep deprivation and your body, and your hormones have gone haywire. Sounds like a form of torture - actually sleep deprivation is a well-known form of torture.What has happened to this wonderful time! No one talks about how difficult it can be. New mothers feel guilty to complain as they have the picture-perfect image of the new mother with her baby smiling filled with joy and energy.',],
options:[{text: 'OK', nextId: 24}],},

{id:24,text:['Did your mother ever share with you what it was like the first couple of months of having you as a baby?',],
options:[{ text: 'Yes', nextId: 25 },{ text: 'No', nextId: 36 }],},

{id:36,text:['That is normal and many women tend to not share that phase of their life based on how difficult it might has been.',
'It is true that some women do not have a hard time, but most women if you ask lots of questions, will tell you of some difficulties during the first three months. I am going to share with you some realities - not to scare you, but to prepare you, and to make sure that you do not feel guilty, and blame yourself should you struggle once you have your baby.',
'If you are unprepared, you may become alarmed, and this could increase your negative feelings. The more you know the better off you will be.'],options:[{ text: 'OK', nextId: 26 }],},

{id:37,text:['It’s great to hear that you’ve had a relatively stable emotional journey during your pregnancy. Everyone’s experience is unique, and it’s wonderful that you’ve been feeling steady throughout this time. If you have any questions or need support at any point, feel free to reach out.',
'Do you know the signs of depression?',],
options:[{ text: 'Next', nextId: 38 }],},
{id:38,text: ['It can be helpful for everyone to know the signs, whether they’ve experienced it personally or not. If you ever want to learn more about the signs or have any concerns about your mental health or that of someone else, feel free to ask. I’m here to provide information and support whenever you need it. Now, we’ll delve into postpartum depression, which is a more serious condition. New moms must be aware of this.',],options:[{ text: 'Next', nextId: 39 }],},

{id:39,text: ['After the birth, postpartum depression is usually slow and gradual. It usually happens within the first two months, and you may start to feel you cannot take care of your baby in the right way, you think you are not a good mother, you feel badly about yourself, you feel a burden to others. There is significant difficulty in the ability to care for your baby, care for yourself, and cope with family relationships.',],options:[{ text: 'Next', nextId: 40 }],},
{id:40,text:['About 10-15% of new mothers show symptoms of postpartum depression. This means one in seven women will experience postpartum depression. For women who are on public assistance or struggle financially it is more common: about one in three such women will experience postpartum depression. Women who have had previous episodes of depression are more likely to experience depression after childbirth. Those women who have had postpartum depression are also more likely to experience it again.',]
,options:[{ text: 'Next', nextId: 41 }],},
{id:41,text:['The symptoms can begin gradually, but they can often build leaving a new mom feeling overwhelmed, hopeless, or frustrated. Some common thoughts may be “I cannot take care of my baby in the right way, I am not a good mother, I am a burden to others.',]
,options:[{ text: 'Next', nextId: 42 }],},
{id:42,text:['While baby blues are temporary, postpartum depression is characterized by persistent negative emotions and a diminished ability to function. Symptoms typically last for at least two weeks.',],options:[{ text: 'Next', nextId: 43 }],},
{id:43,text: ['Some common signs include feeling overwhelmed, hopeless, or guilty about caring for your baby. You might also experience difficulty sleeping or eating, or a loss of interest in activities you once enjoyed.',]
,options:[{ text: 'Next', nextId: 44 }],},
{id:44,text:['It can be scary, but the important message is that postpartum depression is treatable. If you experience these symptoms, please reach out to your healthcare provider immediately.',]
,options:[{ text: 'Next', nextId: 31 }],},





{id:25,text: ['I’m so glad to hear that your mom shared that with you.',
'It is true that some women do not have a hard time, but most women if you ask lots of questions, will tell you of some difficulties during the first three months. I am going to share with you some realities - not to scare you, but to prepare you, and to make sure that you do not feel guilty, and blame yourself should you struggle once you have your baby. If you are unprepared, you may become alarmed, and this could increase your negative feelings. The more you know the better off you will be.',],options:[{ text: 'OK', nextId: 26 }],},
{id:26,text: ['Let’s discuss the range of postpartum “blues”. Women do feel differently in that time after the birth of their baby. For some it is worse than for others, and lasts longer. As we discussed earlier, some women fall in love immediately with their baby are overjoyed and remain overjoyed, while others may feel very overwhelmed.',],options:[{ text: 'Next', nextId: 27 }],},

{id:27,text: ['Most new mothers (about 30-80%) have the “baby blues.” Baby blues is usually two to five days after childbirth. You may experience periods of weeping for no reason, mood swings, be very sensitive, feel overwhelmed, irritable, and just plain exhausted. It is a very emotional time and you are caught off guard. You think I have a beautiful, healthy baby how can I feel like crying? This phase usually passes in a few days to a few weeks, as you and your body adjusts to your new situation. Usually, it lasts about 10 days.',],options:[{ text: 'Next', nextId: 28 }],},
{id:28,text: ['Have you experienced any emotional changes during your pregnancy so far?',],options:[{ text: 'Yes', nextId: 29 },{ text: 'No', nextId: 37 }],},
{id:29,text: ['Its natural you are feeling this and thanks for sharing. Now let’s talk about Postpartum Depression. Some new mothers have a more upsetting time and the difficulties we have discussed are more long-lasting and more intense. Postpartum depression is when the symptoms persist, nearly every day and there is no relief for at least two weeks.',

'Do you know the signs of depression?',],options:[{ text: 'Yes', nextId: 30 },{ text: 'No', nextId: 38 }],},
{id:30,text: ['Great to hear! Knowing the signs of depression can be crucial for understanding your mental health and seeking support when needed. If you have any questions about the signs or want to discuss them further, feel free to ask. I’m here to provide information and support. It’s great you’re aware of your emotions. We’ll discuss coping mechanisms for emotional changes in future sessions.',],options:[{ text: 'Next', nextId: 31 }],},
{id:31,text: ['Before we wrap up this session, do you understand the difference between baby blues and postpartum depression?',],options:[{ text: 'Yes', nextId: 32 },{ text: 'No', nextId: 45 }],},
{id:32,text: ['Great job! If you have any questions about the differences between baby blues and postpartum depression, feel free to ask. I’m here to help clarify any concerns you might have. As a reminder here are the symptoms you should look out for:',
'BABY BLUES - 30-80% of people experience Baby Blues It usually occurs 2-5 days after delivery and usually goes away after about two weeks. Some symptoms are',
'CryingMood swings',
'Exhaustion',
'Tension',
'Anxiety',
'Restlessness',],options:[{ text: 'Next', nextId: 33 }],},

{id:33,text:['POSTPARTUM DEPRESSION SESSION Sleep problems (example: you cannot return to sleep after feeding the baby)',

'Eating problems-eating too much or too little',
'Anxiety and worryAvoiding people, avoiding contact with the baby, wanting to be on your own',
'No energy',
'Death wish, suicidal thoughts',
'Difficulty having positive feelings towards the baby',
'Difficulty making decisions',
'Mania-feeling speedy, being excitable and irritable, talking fast, and having less need for sleep',
'Panic attacks',
'Fears for the baby, fantasies about harming or killing the baby',],options:[{ text: 'Next', nextId: 34 }],},
{id:34,text: ['If you ever feel that you might hurt yourself, your baby or anyone else, please talk to your healthcare provider or call 911.',],options:[{ text: 'Next', nextId: 35 }],},
{id:35,text: ['In the next session, we will help you understand postpartum depression risk factors, symptoms, and treatment options.',
'Emphasizing normalcy of feelings, importance of seeking help, and strategies for coping and seeking support during the transition to motherhood.',],options:[{ text: 'Next', nextId: 48 }],},

{id:45,text: ['No worries. Let’s quickly review it. The distinction between baby blues and postpartum depression lies in their duration, severity, and impact on daily functioning. Baby blues are typically mild, transient feelings of sadness and mood swings that occur within the first few weeks after childbirth and often resolve on their own.',]
,options:[{ text: 'OK', nextId: 46 }],},
{id:46,text: ['On the other hand, postpartum depression is a more serious and longer-lasting condition characterized by persistent feelings of sadness, hopelessness, and anxiety that can significantly interfere with a mother’s ability to care for herself and her baby. It’s essential to recognize the signs and seek support if you or someone you know may be experiencing postpartum depression. Here is a list that could be helpful.',],options:[{ text: 'OK', nextId: 32 }]},


// Session 2

{id:48,text: ['Press OK if you would like to proceed to the session where we will go through relaxation exercises and role transitions.',],options:[{ text: 'OK', nextId: 49 },{ text: 'Repeat Session 1', nextId: 1 }],},

    {
      id: 49,
      text: [
        'Before we start today’s session, please let me ask a couple of questions to help me better understand how to better help you with any issues.',
        'Over the last 24 hours, how often have you been bothered by having little interest or pleasure in doing things?',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 50 },{ text: '1', nextId: 50 },{ text: '2', nextId: 50 },{ text: '3', nextId: 50 }],
    },
        {
      id: 50,
      text: [
        'Over the last 24 hours, how often have you been bothered by feeling down, depressed, or hopeless?',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 51 },{ text: '1', nextId: 51 },{ text: '2', nextId: 51 },{ text: '3', nextId: 51 }],
    },
                    {
    id: 51,
      text: [
        'Over the last 2 weeks, how often have you been bothered by any of the following problems?',
        'Little interest or pleasure in doing things? On a scale of 0 to 3:',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 52 },{ text: '1', nextId: 52 },{ text: '2', nextId: 52 },{ text: '3', nextId: 52 }],
    },
                        {
    id: 52,
      text: [
        'Feeling down, depressed, or hopeless? On a scale of 0 to 3:',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 53 },{ text: '1', nextId: 53 },{ text: '2', nextId: 53 },{ text: '3', nextId: 53 }],
    },                        {
    id: 53,
      text: [
        'Trouble falling or staying asleep, or sleeping too much? On a scale of 0 to 3:',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 54 },{ text: '1', nextId: 54 },{ text: '2', nextId: 54 },{ text: '3', nextId: 54 }],
    },
    {
    id: 54,
      text: [
        'Feeling tired or having little energy? On a scale of 0 to 3:',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 55 },{ text: '1', nextId: 55 },{ text: '2', nextId: 55 },{ text: '3', nextId: 55 }],
    },
    {
    id: 55,
      text: [
        'Poor appetite or overeating? On a scale of 0 to 3:',
        'On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 56 },{ text: '1', nextId: 56 },{ text: '2', nextId: 56 },{ text: '3', nextId: 56 }],
    },
    {
    id: 56,
      text: [
        'Feeling bad about yourself or that you are a failure or have let yourself or your family down? On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 57 },{ text: '1', nextId: 57 },{ text: '2', nextId: 57 },{ text: '3', nextId: 57 }],
    },  
    {
    id: 57,
      text: [
        'Trouble concentrating on things, such as reading the newspaper or watching television? On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 58 },{ text: '1', nextId: 58 },{ text: '2', nextId: 58 },{ text: '3', nextId: 58 }],
    },
    {
    id: 58,
      text: [
        'Moving or speaking so slowly that other people could have noticed. Or the opposite being so figety or restless that you have been moving around a lot more than usual? On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 59 },{ text: '1', nextId: 59 },{ text: '2', nextId: 59 },{ text: '3', nextId: 59 }],
    },
    {
    id: 59,
      text: [
        'Thoughts that you would be better off dead, or of hurting yourself? On a scale of 0 to 3:',
        '0 - Not at all.',
        '1 - Some of the time.',
        '2 - Half of the time.',
        '3 - Most of the time.'
      ],
      options: [{ text: '0', nextId: 60 },{ text: '1', nextId: 60 },{ text: '2', nextId: 60 },{ text: '3', nextId: 60 }],
    },
    {
    id: 60,
      text: [
        'The survey has detected high levels of stress. Please know that help is here for you. Call or text the National Maternal Mental Health Hotline at 1-833-TLC-MAMA (1-833-852-6262) before continuing with the session.'
      ],
      options: [{ text: 'OK', nextId: 61 }],
    },
      {
    id: 61,
      text: [
        'Have you contacted the listed phone number?'
      ],
      options: [{ text: 'Yes', nextId: 62 },{ text: 'No', nextId: 60 }],
    },
    {
    id: 62,
      text: [
        'Welcome to Session 2!!! Today we will delve into Relaxation Exercise and Role Transition.',
'From research we know women who have had previous episode/s of depression, especially postpartum depression, are more likely to experience depression after childbirth. Also, those who have a history of depression or a family member with depression or mental health problems, and those who have a poor support system. What is important is that it can and should be treated. As a reminder here are the postpartum depression symptoms:',
'Eating problems-eating too much or too little.Anxiety and worry',
'Avoiding people, avoiding contact with the baby, wanting to be on your own',
'No energy',
'Thoughts of suicide',
'Difficulty having positive feelings towards the baby',
'Difficulty making decisions',
'Mania-feeling speedy, being excitable and irritable, talking fast, and having less need for sleep',
'Panic attacks',
'Fears for the baby, fantasies about harming or killing the baby'
      ],
      options: [{ text: 'OK', nextId: 63 }],
    },
    {
    id: 62,
      text: [
        'If you have any of the symptoms we have discussed, please discuss with your doctor, healthcare provider, or even your baby’s doctor and ask for a referral to a mental health professional, a therapist, counselor, social worker or a psychiatrist. Here are different resources and keep it handy: Maternal Mental Health Hotline Domestic Violence Parenting Legal Services Suicide Prevention',
      ],
      options: [{ text: 'OK', nextId: 63 }],
    },
    {
    id: 63,
      text: [
        'The most important message to take home with you from these sessions is that although you may have the "baby blues, or even depression after delivery, you should not be ashamed of these feelings, feel guilty, think I am a bad mother, or think there’s something so wrong with me.',
      ],
      options: [{ text: 'OK', nextId: 64 }],
    },
     {
    id: 64,
      text: [
        'You need to understand that many of these feelings are normal reactions to having a new baby. Remember: You are not alone, you are not to blame and you can feel better.',
      ],
      options: [{ text: 'OK', nextId: 65 }],
    },   
       {
    id: 65,
      text: [
        'Also, it is okay to talk about your difficulties. Don’t be embarrassed or afraid to discuss your feelings with friends, family and your healthcare provider. Actually, you will feel a lot better if you do talk to someone close to you about your feelings.',
'Having a baby is a major event that affects the body and the mind. This all happens at a time when you are required to take care of a needy, helpless, human being, and with little sleep and often with very little outside help. In the next few sessions, we will be talking about ways to cope with the “roller-coaster ride” that you might experience after having your baby.',
      ],
      options: [{ text: 'OK', nextId: 66 }],
    },   
       {
    id: 66,
      text: [
        'I cannot smooth the road for you or take away some of the bad bumps. However, we will discuss ways for you to manage the blues or down times so that you do not spiral down into a depression.',
      ],
      options: [{ text: 'OK', nextId: 67 }],
    },   
       {
    id: 67,
      text: [
        'Our ROSE protocol approach is based on the idea that you are facing a very major transition. We know that this is going to take new skills and place new demands. One major issue when we face stress is that it can really help to have great support. Good support can reduce the likelihood that a woman will develop postpartum depression after delivery. Unfortunately, at the same time that you deserve incredible amounts of support, many women are surprised to realize that it is not so easy to find during this period.',
      ],
      options: [{ text: 'OK', nextId: 68 }],
    },   
           {
    id: 68,
      text: [
        'Demands of being with the baby can reduce time to spend with others socially, demands of the baby can be very hard on relationships, and others may simply not realize the types of support or help that would be nice for you. So, we at nurtur want to do everything we can to help you feel that you are getting as much support as you deserve.',
        'We cannot guarantee this, but we can certainly help think about your goals for support, and teach you some strategies to help in that area. We will focus on different ways to decrease stress in your life once your baby is here, and talk about supportive people in your life.'
      ],
      options: [{ text: 'OK', nextId: 69 }],
    },
           {
    id: 69,
      text: [
'On a scale from 1 to 10 with 1 being no anxiety and 10 being high anxiety, where would you rate your anxiety level right now?'
      ],
      options: [{ text: '1', nextId: 70 },{ text: '2', nextId: 70 },{ text: '3', nextId: 70 },{ text: '4', nextId: 70 },{ text: '5', nextId: 70 },{ text: '6', nextId: 70 },{ text: '7', nextId: 70 },{ text: '8', nextId: 70 },{ text: '9', nextId: 70 },{ text: '10', nextId: 70 }],
    },
               {
    id: 70,
      text: [
'I’m going to provide you with the script for the exercise. I recommend practicing for 10-20 minutes daily. Regular practice will reinforce your relaxation skills, so you will be more likely to use it whenever you are in need of stress control.',
'Let’s begin by finding a comfortable position, either sitting or lying down, whichever feels best for you. Take a deep breath in, and as you exhale, let go of any tension in your body.'
      ],
      options: [{ text: 'OK', nextId: 71 }],
    },
                   {
    id: 71,
      text: [
'Now let’s start with a relaxation exercise called Progressive Muscle Relaxation.',
'1. Finding ways to relax and manage stress can be very helpful when dealing with life’s stresses, in general, and dealing with stressful relationships or if you have difficulty falling sleep.',
'2. Relaxation techniques also have been shown to reduce stress and tension. Progressive Muscle Relaxation is designed to relax the muscles in your body by teaching you to tense then relax various muscle groups.',
'3. By first creating tension and then releasing that tension all at once, you can produce a better reduction in muscle tension. The sudden release of tension creates a special kind of energy which allows the muscles to relax beyond even normal resting levels.',
'4. Move your attention to your calves and thighs. Tighten the muscles in your lower legs by pressing your heels into the ground, and then release. Feel the warmth and relaxation spreading through your legs.',
'5. Next, tense the muscles in your buttocks by squeezing them tightly, and then let go. Notice the difference between tension and relaxation in your body.',
'6. Now, focus on your stomach. Tighten your abdominal muscles by drawing your belly button towards your spine, and then release. Allow your breathing to become deep and natural.',
'7. Move your attention to your chest and back. Take a deep breath in, filling your lungs with air, and hold for a moment. Now, exhale slowly and completely, releasing any tension in your chest and back muscles.',
'8. Shift your focus to your shoulders. Shrug them up towards your ears, and then let them drop down, releasing any tension you may be holding. Feel the weight of your shoulders sinking into the surface below you.',
'9. Now, move to your arms and hands. Make fists with your hands, squeezing tightly, and then release. Feel the tension leaving your arms as you allow them to become heavy and relaxed.',
'10. Finally, focus on your face and neck. Scrunch up your face tightly, wrinkling your forehead and squinting your eyes, and then release. Let your jaw relax, allowing your lips to part slightly.',
'11. Take a moment to scan your body from head to toe, noticing any remaining areas of tension.',
'12. If you notice any tension, take a deep breath in, and as you exhale, imagine that tension melting away, leaving you feeling completely relaxed and at ease.',
'13. Continue to breathe deeply and slowly for a few more moments, enjoying the sensation of relaxation in your body.',
'14. When you’re ready, gently open your eyes and return to the present moment, feeling refreshed and rejuvenated.'
      ],
      options: [{ text: 'OK', nextId: 72 }],
    },
               {
    id: 72,
      text: [
'Now, on that same scale from 1 to 10, where would you rate your anxiety level? Display numbers from 1 to 10'
      ],
      options: [{ text: '1', nextId: 73 },{ text: '2', nextId: 73 },{ text: '3', nextId: 73 },{ text: '4', nextId: 73 },{ text: '5', nextId: 73 },{ text: '6', nextId: 73 },{ text: '7', nextId: 73 },{ text: '8', nextId: 73 },{ text: '9', nextId: 73 },{ text: '10', nextId: 73 }],
    },
               {
    id: 73,
      text: [
'Wonderful! I’m glad it helped bring your stress level down. Now, let’s move on to our main topic for today which is Role Transitions.',
'Having a baby is going to change your life. Both good and bad changes can be stressful as both bring about new demands, new schedules.',
'Think of how stressful a wedding can be for a bride. Big changes, particularly stressful ones, are often associated with depression. One of the high-risk periods for depression is when moms have very young children in the home.'
      ],
      options: [{ text: 'OK', nextId: 74 }],
    },
              {
    id: 74,
      text: [
'The good news is that there is a great deal known about how to effectively make it through big changes. Today, we are going to guide you through some of the important tools in thinking about these types of major changes/transitions. I have information that previews the role transitions we’ll be discussing. Can you think of any other examples of changes you’ve experienced, the changes you had to make during a change in roles, and how you survived?']},

              {
    id: 75,
      text: [
'I understand and acknowledge what you mean. Now let’s talk about changes that a new baby will bring in your life. By increasing our understanding, we can hope to do a better job in meeting our needs during this time of upheaval.'
      ],
      options: [{ text: 'OK', nextId: 76 }],
    },
              {
    id: 76,
      text: [
'Let’s start by exploring some of the losses or things you might miss or have to change when the baby comes. What are some losses that come to your mind?'
      ]
    },
              {
    id: 77,
      text: [
'I understand and acknowledge what you mean. Some examples of losses are:-',
'2. Loss of routine, as a baby disrupts the 24-hour schedule',
'3. Household chores not getting done',
'4. Less time for partner, other children, friends, etc.',
'5. Loss of productivity with laundry, shopping.',
'6. Less opportunity to socialize leading to isolation.',
'7. Loss of a sense of purpose being home for hours on end.',
'8. Even loss of physical space, needing to share a room with baby or move out of current living situation.',
'9. Isolation'
      ],
      options: [{ text: 'next', nextId: 78 }],
    },   

              {
    id: 78,
      text: [
'It’s important to acknowledge these losses. But let’s also explore the benefits and new opportunities you might gain as a new mother. What are some things you’re looking forward to or think might be positive about this change?'
      ]    },

              {
    id: 79,
      text: [
'That’s great. Staying home with a new baby can force you to:-',
'Spend time with your baby.',
'Watch the growth of your baby.',
'It’s an opportunity to enjoy your child’s reactions to the world.',
'Slow your pace, instead of leading a hectic life.',
'You’ll learn more about yourself as a mother, may discover some hidden talents',
'Nice excuse out of chores 😊'
      ],
      options: [{ text: 'Next', nextId: 80 }],
    },
    {
    id: 80,
      text: [
'It’s normal to have a range of feelings with this change - anger, fear, insecurity. What are some of the feelings coming up for you as you think about these losses and gains?'
      ]    },
    {
    id: 81,
      text: [
'Those are very understandable feelings. It’s important to acknowledge them and not feel guilty. You will still be able to enjoy life but you may need to do it in a different way. The most important rule in surviving motherhood is to do things to take care of your needs. Nurture the mother.'
      ],
      options: [{ text: 'Next', nextId: 82 }],
    },
      {
    id: 82,
      text: [
'Being a mother is like being a pitcher of water - you keep pouring out, giving and giving as you take care of the needs around you - baby, family, friends, partner.',
'If you do not take action and fill the pitcher up again, pretty soon it will be empty.',
'No one is a bottomless pitcher. Being on empty will make you very vulnerable to depression. You cannot be a good parent if your needs are not met. Give yourself permission.'
      ],
      options: [{ text: 'OK', nextId: 83 }],
    },  
      {
    id: 83,
      text: [
'Thoughts such as I am being cranky, weak, spoiled, selfish will keep jumping in your mind but you must correct yourself and think I am investing in myself for my baby/family. It is important to add positive activities and experiences when you are losing other positive things that made you feel good about yourself. It is natural that you will be less motivated, and tired at this time. But deliberately adding positive activities can reduce the negative feelings-it can energize you.'
      ],
      options: [{ text: 'Next', nextId: 84 }],
    },  
    {
    id: 84,
      text: [
'There is a direct relationship between pleasant activities and mood, the more enjoyable things you do, the better you are likely to feel. But you have to give yourself permission to do this. In the next session we will discuss some of tjhe positive activities you could see yourself doing once you have the baby. Have a great day! We can chat tomorrow.'
      ],
      options: [{ text: 'OK', nextId: 85 }],
    },  
    {
    id: 85,
      text: [
'Would you like to proceed ahead to the next session where we will talk about Enjoyable Activities and Close People.'
      ],
      options: [{ text: 'Yes', nextId: 86 },{ text: 'No', nextId: 86 }],
    },  
  ],
  es: [
  
{ id: 1, text: [ 'Hola, soy Nayomi.', '¡Bienvenida a la plataforma nurtur! Entendemos los desafíos únicos que vienen con ser una futura mamá y nuestra plataforma está diseñada para apoyarte durante tu viaje de embarazo proporcionando un protocolo clínicamente probado adaptado a tus necesidades.' ], options: [ { text: 'Siguiente', nextId: 2 } ], }, { id: 2, text: 'Al completar todos los módulos, estarás equipada con valiosos conocimientos y herramientas para navegar las complejidades del período postparto con mayor facilidad. Nuestro programa se basa en un protocolo probado para prevenir la depresión postparto hasta en un 53%.', options: [ { text: 'Siguiente', nextId: 3 } ], }, { id: 3, text: 'Tu bienestar es nuestra prioridad, así que no dudes en comunicarte si tienes alguna pregunta o necesitas más ayuda en el camino. Emprendamos juntos este viaje y empoderémonos para priorizar el autocuidado mientras cuidas de tu creciente familia.', options: [ { text: 'Siguiente', nextId: 4 } ], }, { id: 4, text: 'Déjame saber cuando estés lista para empezar.', options: [{ text: 'Siguiente', nextId: 5 }], }, { id: 5, text: [ 'Antes de empezar la sesión de hoy, permíteme hacerte un par de preguntas para entender mejor cómo ayudarte con cualquier problema.', 'En las últimas 24 horas, ¿con qué frecuencia te has sentido molesta por tener poco interés o placer en hacer cosas?', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 6 },{ text: '1', nextId: 6 },{ text: '2', nextId: 6 },{ text: '3', nextId: 6 }], }, { id: 6, text: [ 'En las últimas 24 horas, ¿con qué frecuencia te has sentido deprimida, triste o sin esperanzas?', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 7 },{ text: '1', nextId: 7 },{ text: '2', nextId: 7 },{ text: '3', nextId: 7 }], }, { id: 10, text: [ 'En las últimas 2 semanas, ¿con qué frecuencia te han molestado los siguientes problemas?', 'Poco interés o placer en hacer cosas? En una escala del 0 al 3:', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 11 },{ text: '1', nextId: 11 },{ text: '2', nextId: 11 },{ text: '3', nextId: 11 }], }, { id: 11, text: [ 'Sentirse deprimida, triste o sin esperanzas? En una escala del 0 al 3:', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 12 },{ text: '1', nextId: 12 },{ text: '2', nextId: 12 },{ text: '3', nextId: 12 }], }, { id: 12, text: [ 'Problemas para dormir o dormir demasiado? En una escala del 0 al 3:', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 13 },{ text: '1', nextId: 13 },{ text: '2', nextId: 13 },{ text: '3', nextId: 13 }], }, { id: 13, text: [ 'Sentirse cansada o tener poca energía? En una escala del 0 al 3:', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 14 },{ text: '1', nextId: 14 },{ text: '2', nextId: 14 },{ text: '3', nextId: 14 }], }, { id: 14, text: [ 'Poco apetito o comer en exceso? En una escala del 0 al 3:', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 15 },{ text: '1', nextId: 15 },{ text: '2', nextId: 15 },{ text: '3', nextId: 15 }], }, { id: 15, text: [ 'Sentirse mal contigo misma o que has fallado a ti misma o a tu familia? En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 16 },{ text: '1', nextId: 16 },{ text: '2', nextId: 16 },{ text: '3', nextId: 16 }], }, { id: 16, text: [ 'Problemas para concentrarte en cosas como leer el periódico o ver televisión? En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 17 },{ text: '1', nextId: 17 },{ text: '2', nextId: 17 },{ text: '3', nextId: 17 }], }, { id: 17, text: [ 'Moverse o hablar tan lentamente que otras personas podrían haberlo notado. O lo contrario, estar tan inquieta o inquieta que has estado moviéndote mucho más de lo usual? En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 18 },{ text: '1', nextId: 18 },{ text: '2', nextId: 18 },{ text: '3', nextId: 18 }], }, { id: 18, text: [ 'Pensamientos de que estarías mejor muerta o de lastimarte a ti misma? En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 19 },{ text: '1', nextId: 19 },{ text: '2', nextId: 19 },{ text: '3', nextId: 19 }], }, { id: 19, text: [ 'La encuesta ha detectado altos niveles de estrés. Por favor, sepa que hay ayuda disponible para ti. Llama o envía un mensaje de texto a la Línea Nacional de Salud Mental Materna al 1-833-TLC-MAMA (1-833-852-6262) antes de continuar con la sesión.' ], options: [{ text: 'OK', nextId: 47 }], }, { id: 47, text: [ '¿Has contactado el número de teléfono listado?' ], options: [{ text: 'Sí', nextId: 7 },{ text: 'No', nextId: 19 }], }, { id: 7, text: [ 'Gracias. Empecemos con la sesión de hoy.', 'Hola, soy Nayomi, tu educadora prenatal virtual aquí. ¡Felicidades por tu embarazo!' ], options: [{ text: 'Sí', nextId: 8 }], }, { id: 8, text: [ 'Estoy aquí para apoyarte a través del Programa ROSE, que significa Reaching Out to Social Support and Education. Es una serie de sesiones diseñadas para enseñarte habilidades para manejar el estrés, especialmente después de que llegue tu bebé.' ], options: [{ text: 'OK', nextId: 20 }], }, { id: 20, text: [ 'Tener un bebé es un momento de alegría, pero también puede traer nuevos desafíos. Queremos ayudarte a empezar bien para tu bebé y para ti. Puede ser útil reservar un tiempo específico cada día para completar estas sesiones.', 'Antes de comenzar, limita cualquier distracción para mantenerte concentrada. En promedio, cada sesión tomará entre 10 a 15 minutos, así que puedes planificar en consecuencia.' ], options: [{ text: 'OK', nextId: 21 }], }, { id: 21, text: [ 'Selecciona siguiente cuando estés lista para continuar.' ], options: [{ text: 'SIGUIENTE', nextId: 22 }], }, { id: 22, text: [ 'Las mujeres no son todas iguales. Algunas mujeres están muy felices de tener un bebé y dirán que nunca han sido más felices. Otras pueden tener sentimientos encontrados - a veces se sienten “muy felices” y otras veces “muy abrumadas”. Y para algunas mujeres es muy estresante. Sin embargo, nadie habla de lo difícil que puede ser - los cambios que tendrás que hacer y que convertirse en madre puede ser uno de los trabajos más difíciles de tu vida - un trabajo que viene con muy poca capacitación.' ], options: [{ text: 'Siguiente', nextId: 23 }], }, { id: 23, text: [ 'Si lo piensas de manera realista, tienes que dejar de lado tus propias necesidades, tienes que alimentar, acunar, cambiar pañales, ropa, sin mencionar las tareas domésticas regulares - además de todos tus otros roles como pareja, hija, amiga, trabajadora. Todo esto mientras estás agotada por la falta de sueño y tu cuerpo, y tus hormonas se han vuelto locas. Suena como una forma de tortura, de hecho, la privación del sueño es una forma de tortura bien conocida. ¿Qué ha pasado con este tiempo maravilloso? Nadie habla de lo difícil que puede ser. Las nuevas madres se sienten culpables de quejarse porque tienen la imagen perfecta de la nueva madre con su bebé sonriendo llena de alegría y energía.' ], options: [{ text: 'OK', nextId: 24 }], }, { id: 24, text: [ '¿Tu madre alguna vez te contó cómo fueron los primeros meses de tenerte como bebé?' ], options: [{ text: 'Sí', nextId: 25 },{ text: 'No', nextId: 36 }], }, { id: 36, text: [ 'Eso es normal y muchas mujeres tienden a no compartir esa fase de su vida en función de lo difícil que pudo haber sido.', 'Es cierto que algunas mujeres no tienen un tiempo difícil, pero la mayoría de las mujeres si les haces muchas preguntas, te contarán algunas dificultades durante los primeros tres meses. Voy a compartir contigo algunas realidades - no para asustarte, sino para prepararte, y para asegurarte de que no te sientas culpable y te culpes a ti misma si luchas una vez que tengas a tu bebé.', 'Si no estás preparada, puedes alarmarte y esto podría aumentar tus sentimientos negativos. Cuanto más sepas, mejor estarás.' ], options: [{ text: 'OK', nextId: 26 }], }, { id: 37, text: [ 'Es genial escuchar que has tenido un viaje emocional relativamente estable durante tu embarazo. La experiencia de cada persona es única, y es maravilloso que te hayas sentido estable durante este tiempo. Si tienes alguna pregunta o necesitas apoyo en cualquier momento, no dudes en comunicarte.', '¿Conoces los signos de la depresión?' ], options: [{ text: 'Siguiente', nextId: 38 }], }, { id: 38, text: [ 'Puede ser útil para todos conocer los signos, ya sea que lo hayan experimentado personalmente o no. Si alguna vez quieres aprender más sobre los signos o tienes alguna preocupación sobre tu salud mental o la de otra persona, no dudes en preguntar. Estoy aquí para proporcionar información y apoyo cuando lo necesites. Ahora, profundizaremos en la depresión postparto, que es una condición más grave. Es importante que las nuevas mamás estén conscientes de esto.' ], options: [{ text: 'Siguiente', nextId: 39 }], }, { id: 39, text: [ 'Después del nacimiento, la depresión postparto suele ser lenta y gradual. Generalmente ocurre dentro de los primeros dos meses, y puedes comenzar a sentir que no puedes cuidar a tu bebé de la manera correcta, piensas que no eres una buena madre, te sientes mal contigo misma, te sientes una carga para los demás. Hay una dificultad significativa en la capacidad de cuidar a tu bebé, cuidarte a ti misma y lidiar con las relaciones familiares.' ], options: [{ text: 'Siguiente', nextId: 40 }], }, { id: 40, text: [ 'Aproximadamente el 10-15% de las nuevas madres muestran síntomas de depresión postparto. Esto significa que una de cada siete mujeres experimentará depresión postparto. Para las mujeres que reciben asistencia pública o tienen dificultades financieras, es más común: aproximadamente una de cada tres de estas mujeres experimentará depresión postparto. Las mujeres que han tenido episodios previos de depresión tienen más probabilidades de experimentar depresión después del parto. Aquellas mujeres que han tenido depresión postparto también tienen más probabilidades de experimentarla nuevamente.' ], options: [{ text: 'Siguiente', nextId: 41 }], }, { id: 41, text: [ 'Los síntomas pueden comenzar gradualmente, pero a menudo pueden aumentar dejando a una nueva madre sintiéndose abrumada, sin esperanza o frustrada. Algunos pensamientos comunes pueden ser “No puedo cuidar a mi bebé de la manera correcta, no soy una buena madre, soy una carga para los demás.' ], options: [{ text: 'Siguiente', nextId: 42 }], }, { id: 42, text: [ 'Mientras que los baby blues son temporales, la depresión postparto se caracteriza por emociones negativas persistentes y una capacidad disminuida para funcionar. Los síntomas generalmente duran al menos dos semanas.' ], options: [{ text: 'Siguiente', nextId: 43 }], }, { id: 43, text: [ 'Algunos signos comunes incluyen sentirse abrumada, sin esperanza o culpable por cuidar a tu bebé. También podrías experimentar dificultades para dormir o comer, o una pérdida de interés en actividades que antes disfrutabas.' ], options: [{ text: 'Siguiente', nextId: 44 }], }, { id: 44, text: [ 'Puede dar miedo, pero el mensaje importante es que la depresión postparto es tratable. Si experimentas estos síntomas, por favor comunícate con tu proveedor de atención médica de inmediato.' ], options: [{ text: 'Siguiente', nextId: 31 }], }, { id: 25, text: [ 'Me alegra escuchar que tu madre compartió eso contigo.', 'Es cierto que algunas mujeres no tienen un tiempo difícil, pero la mayoría de las mujeres si les haces muchas preguntas, te contarán algunas dificultades durante los primeros tres meses. Voy a compartir contigo algunas realidades - no para asustarte, sino para prepararte, y para asegurarte de que no te sientas culpable y te culpes a ti misma si luchas una vez que tengas a tu bebé. Si no estás preparada, puedes alarmarte y esto podría aumentar tus sentimientos negativos. Cuanto más sepas, mejor estarás.' ], options: [{ text: 'OK', nextId: 26 }], }, { id: 26, text: [ 'Hablemos del rango de “baby blues”. Las mujeres se sienten diferentes en ese tiempo después del nacimiento de su bebé. Para algunas es peor que para otras y dura más. Como discutimos antes, algunas mujeres se enamoran inmediatamente de su bebé y están muy felices, mientras que otras pueden sentirse muy abrumadas.' ], options: [{ text: 'Siguiente', nextId: 27 }], }, { id: 27, text: [ 'La mayoría de las nuevas madres (aproximadamente el 30-80%) tienen los “baby blues”. Los baby blues suelen aparecer entre dos a cinco días después del parto. Puedes experimentar períodos de llanto sin razón, cambios de humor, ser muy sensible, sentirte abrumada, irritable y simplemente agotada. Es un momento muy emocional y te toma por sorpresa. Piensas que tienes un bebé hermoso y saludable, ¿cómo puedo sentir ganas de llorar? Esta fase suele pasar en unos días a unas semanas, a medida que tú y tu cuerpo se ajustan a tu nueva situación. Generalmente, dura alrededor de 10 días.' ], options: [{ text: 'Siguiente', nextId: 28 }], }, { id: 28, text: [ '¿Has experimentado algún cambio emocional durante tu embarazo hasta ahora?' ], options: [{ text: 'Sí', nextId: 29 },{ text: 'No', nextId: 37 }], }, { id: 29, text: [ 'Es natural que te sientas así y gracias por compartir. Ahora hablemos de la Depresión Postparto. Algunas nuevas madres tienen un tiempo más perturbador y las dificultades que hemos discutido son más duraderas y más intensas. La depresión postparto es cuando los síntomas persisten, casi todos los días y no hay alivio durante al menos dos semanas.', '¿Conoces los signos de la depresión?' ], options: [{ text: 'Sí', nextId: 30 },{ text: 'No', nextId: 38 }], }, { id: 30, text: [ '¡Me alegra escucharlo! Conocer los signos de la depresión puede ser crucial para entender tu salud mental y buscar apoyo cuando sea necesario. Si tienes alguna pregunta sobre los signos o quieres discutirlos más a fondo, no dudes en preguntar. Estoy aquí para proporcionar información y apoyo. Es genial que estés consciente de tus emociones. Discutiremos mecanismos de afrontamiento para los cambios emocionales en futuras sesiones.' ], options: [{ text: 'Siguiente', nextId: 31 }], }, { id: 31, text: [ 'Antes de terminar esta sesión, ¿entiendes la diferencia entre los baby blues y la depresión postparto?' ], options: [{ text: 'Sí', nextId: 32 },{ text: 'No', nextId: 45 }], }, { id: 32, text: [ '¡Buen trabajo! Si tienes alguna pregunta sobre las diferencias entre los baby blues y la depresión postparto, no dudes en preguntar. Estoy aquí para ayudar a aclarar cualquier preocupación que puedas tener. Como recordatorio, aquí están los síntomas que debes vigilar:', 'BABY BLUES - El 30-80% de las personas experimentan Baby Blues. Generalmente ocurre de 2 a 5 días después del parto y generalmente desaparece después de unas dos semanas. Algunos síntomas son:', 'Llanto, Cambios de humor', 'Agotamiento', 'Tensión', 'Ansiedad', 'Inquietud' ], options: [{ text: 'Siguiente', nextId: 33 }], }, { id: 33, text: [ 'DEPRESIÓN POSTPARTO - Problemas para dormir (ejemplo: no puedes volver a dormir después de alimentar al bebé)', 'Problemas para comer - comer demasiado o muy poco', 'Ansiedad y preocupación, Evitar a las personas, evitar el contacto con el bebé, querer estar sola', 'Sin energía', 'Deseo de muerte, pensamientos suicidas', 'Dificultad para tener sentimientos positivos hacia el bebé', 'Dificultad para tomar decisiones', 'Manía - sentirse acelerada, estar excitable e irritable, hablar rápido y necesitar menos sueño', 'Ataques de pánico', 'Miedos por el bebé, fantasías de hacerle daño o matar al bebé' ], options: [{ text: 'Siguiente', nextId: 34 }], }, { id: 34, text: [ 'Si alguna vez sientes que podrías lastimarte a ti misma, a tu bebé o a alguien más, por favor habla con tu proveedor de atención médica o llama al 911.' ], options: [{ text: 'Siguiente', nextId: 35 }], }, { id: 35, text: [ 'En la próxima sesión, te ayudaremos a entender los factores de riesgo, síntomas y opciones de tratamiento para la depresión postparto.', 'Enfatizando la normalidad de los sentimientos, la importancia de buscar ayuda y estrategias para afrontarlos y buscar apoyo durante la transición a la maternidad.' ], options: [{ text: 'Siguiente', nextId: 48 }], }, { id: 45, text: [ 'No te preocupes. Vamos a revisarlo rápidamente. La distinción entre baby blues y la depresión postparto radica en su duración, severidad e impacto en el funcionamiento diario. Los baby blues son sentimientos leves y transitorios de tristeza y cambios de humor que ocurren dentro de las primeras semanas después del parto y a menudo se resuelven por sí solos.' ], options: [{ text: 'OK', nextId: 46 }], }, { id: 46, text: [ 'Por otro lado, la depresión postparto es una condición más grave y duradera caracterizada por sentimientos persistentes de tristeza, desesperanza y ansiedad que pueden interferir significativamente en la capacidad de una madre para cuidarse a sí misma y a su bebé. Es esencial reconocer los signos y buscar apoyo si tú o alguien que conoces puede estar experimentando depresión postparto. Aquí hay una lista que podría ser útil.' ], options: [{ text: 'OK', nextId: 32 }], }, { id: 48, text: [ 'Presiona OK si deseas proceder a la sesión donde repasaremos ejercicios de relajación y transiciones de roles.' ], options: [{ text: 'OK', nextId: 49 },{ text: 'Repetir Sesión 1', nextId: 1 }], }, { id: 49, text: [ 'Antes de comenzar la sesión de hoy, permíteme hacerte un par de preguntas para entender mejor cómo ayudarte con cualquier problema.', 'En las últimas 24 horas, ¿con qué frecuencia te has sentido molesta por tener poco interés o placer en hacer cosas?', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 50 },{ text: '1', nextId: 50 },{ text: '2', nextId: 50 },{ text: '3', nextId: 50 }], }, { id: 50, text: [ 'En las últimas 24 horas, ¿con qué frecuencia te has sentido deprimida, triste o sin esperanzas?', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 51 },{ text: '1', nextId: 51 },{ text: '2', nextId: 51 },{ text: '3', nextId: 51 }], }, { id: 51, text: [ 'En las últimas 2 semanas, ¿con qué frecuencia te han molestado los siguientes problemas?', 'Poco interés o placer en hacer cosas? En una escala del 0 al 3:', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 52 },{ text: '1', nextId: 52 },{ text: '2', nextId: 52 },{ text: '3', nextId: 52 }], }, { id: 52, text: [ 'Sentirse deprimida, triste o sin esperanzas? En una escala del 0 al 3:', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 53 },{ text: '1', nextId: 53 },{ text: '2', nextId: 53 },{ text: '3', nextId: 53 }], }, { id: 53, text: [ 'Problemas para dormir o dormir demasiado? En una escala del 0 al 3:', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 54 },{ text: '1', nextId: 54 },{ text: '2', nextId: 54 },{ text: '3', nextId: 54 }], }, { id: 54, text: [ 'Sentirse cansada o tener poca energía? En una escala del 0 al 3:', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 55 },{ text: '1', nextId: 55 },{ text: '2', nextId: 55 },{ text: '3', nextId: 55 }], }, { id: 55, text: [ 'Poco apetito o comer en exceso? En una escala del 0 al 3:', 'En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 56 },{ text: '1', nextId: 56 },{ text: '2', nextId: 56 },{ text: '3', nextId: 56 }], }, { id: 56, text: [ 'Sentirse mal contigo misma o que has fallado a ti misma o a tu familia? En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 57 },{ text: '1', nextId: 57 },{ text: '2', nextId: 57 },{ text: '3', nextId: 57 }], }, { id: 57, text: [ 'Problemas para concentrarte en cosas como leer el periódico o ver televisión? En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 58 },{ text: '1', nextId: 58 },{ text: '2', nextId: 58 },{ text: '3', nextId: 58 }], }, { id: 58, text: [ 'Moverse o hablar tan lentamente que otras personas podrían haberlo notado. O lo contrario, estar tan inquieta o inquieta que has estado moviéndote mucho más de lo usual? En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 59 },{ text: '1', nextId: 59 },{ text: '2', nextId: 59 },{ text: '3', nextId: 59 }], }, { id: 59, text: [ 'Pensamientos de que estarías mejor muerta o de lastimarte a ti misma? En una escala del 0 al 3:', '0 - Para nada.', '1 - Parte del tiempo.', '2 - La mitad del tiempo.', '3 - La mayor parte del tiempo.' ], options: [{ text: '0', nextId: 60 },{ text: '1', nextId: 60 },{ text: '2', nextId: 60 },{ text: '3', nextId: 60 }], }, { id: 60, text: [ 'La encuesta ha detectado altos niveles de estrés. Por favor, sepa que hay ayuda disponible para ti. Llama o envía un mensaje de texto a la Línea Nacional de Salud Mental Materna al 1-833-TLC-MAMA (1-833-852-6262) antes de continuar con la sesión.' ], options: [{ text: 'OK', nextId: 61 }], }, { id: 61, text: [ '¿Has contactado el número de teléfono listado?' ], options: [{ text: 'Sí', nextId: 62 },{ text: 'No', nextId: 60 }], }, { id: 62, text: [ '¡Bienvenida a la Sesión 2! Hoy profundizaremos en el Ejercicio de Relajación y Transición de Roles.', 'A partir de investigaciones, sabemos que las mujeres que han tenido episodios previos de depresión, especialmente depresión postparto, tienen más probabilidades de experimentar depresión después del parto. También aquellas que tienen antecedentes de depresión o un familiar con problemas de depresión o salud mental, y aquellas que tienen un sistema de apoyo deficiente. Lo importante es que puede y debe ser tratada. Como recordatorio, aquí están los síntomas de la depresión postparto:', 'Problemas para comer - comer demasiado o muy poco. Ansiedad y preocupación', 'Evitar a las personas, evitar el contacto con el bebé, querer estar sola', 'Sin energía', 'Pensamientos suicidas', 'Dificultad para tener sentimientos positivos hacia el bebé', 'Dificultad para tomar decisiones', 'Manía - sentirse acelerada, estar excitable e irritable, hablar rápido y necesitar menos sueño', 'Ataques de pánico', 'Miedos por el bebé, fantasías de hacerle daño o matar al bebé' ], options: [{ text: 'OK', nextId: 63 }], }, { id: 62, text: [ 'Si tienes alguno de los síntomas que hemos discutido, por favor habla con tu médico, proveedor de atención médica o incluso el médico de tu bebé y pide una referencia a un profesional de salud mental, un terapeuta, consejero, trabajador social o psiquiatra. Aquí hay diferentes recursos y manténlo a mano: Línea de Salud Mental Materna, Violencia Doméstica, Servicios de Crianza, Servicios Legales, Prevención del Suicidio.' ], options: [{ text: 'OK', nextId: 63 }], }, { id: 63, text: [ 'El mensaje más importante para llevar a casa de estas sesiones es que aunque puedas tener los "baby blues" o incluso depresión después del parto, no deberías avergonzarte de estos sentimientos, sentirte culpable, pensar que eres una mala madre o pensar que hay algo tan mal contigo.' ], options: [{ text: 'OK', nextId: 64 }], }, { id: 64, text: [ 'Debes entender que muchos de estos sentimientos son reacciones normales a tener un nuevo bebé. Recuerda: No estás sola, no tienes la culpa y puedes sentirte mejor.' ], options: [{ text: 'OK', nextId: 65 }], }, { id: 65, text: [ 'Además, está bien hablar sobre tus dificultades. No te sientas avergonzada ni tengas miedo de discutir tus sentimientos con amigos, familiares y tu proveedor de atención médica. De hecho, te sentirás mucho mejor si hablas con alguien cercano a ti sobre tus sentimientos.', 'Tener un bebé es un evento importante que afecta el cuerpo y la mente. Todo esto sucede en un momento en el que se requiere que cuides a un ser humano necesitado e indefenso, y con poco sueño y a menudo con muy poca ayuda externa. En las próximas sesiones, hablaremos sobre formas de lidiar con la “montaña rusa” que podrías experimentar después de tener a tu bebé.' ], options: [{ text: 'OK', nextId: 66 }], }, { id: 66, text: [ 'No puedo suavizar el camino para ti ni quitarte algunos de los baches. Sin embargo, discutiremos formas de gestionar los baby blues o momentos bajos para que no caigas en una depresión.' ], options: [{ text: 'OK', nextId: 67 }], }, { id: 67, text: [ 'Nuestro enfoque del protocolo ROSE se basa en la idea de que estás enfrentando una transición muy importante. Sabemos que esto va a requerir nuevas habilidades y poner nuevas demandas. Un problema importante cuando enfrentamos el estrés es que puede realmente ayudar tener un gran apoyo. Un buen apoyo puede reducir la probabilidad de que una mujer desarrolle depresión postparto después del parto. Desafortunadamente, al mismo tiempo que mereces cantidades increíbles de apoyo, muchas mujeres se sorprenden al darse cuenta de que no es tan fácil encontrarlo durante este período.' ], options: [{ text: 'OK', nextId: 68 }], }, { id: 68, text: [ 'Las demandas de estar con el bebé pueden reducir el tiempo para pasar con otros socialmente, las demandas del bebé pueden ser muy duras para las relaciones y otros simplemente no pueden darse cuenta del tipo de apoyo o ayuda que sería agradable para ti. Así que en nurtur queremos hacer todo lo posible para ayudarte a sentir que estás recibiendo tanto apoyo como mereces.', 'No podemos garantizar esto, pero ciertamente podemos ayudar a pensar en tus metas para el apoyo y enseñarte algunas estrategias para ayudar en esa área. Nos centraremos en diferentes formas de disminuir el estrés en tu vida una vez que tu bebé esté aquí y hablaremos sobre personas que te apoyan en tu vida.' ], options: [{ text: 'OK', nextId: 69 }], }, { id: 69, text: [ 'En una escala del 1 al 10, donde 1 es ninguna ansiedad y 10 es alta ansiedad, ¿dónde calificarías tu nivel de ansiedad ahora mismo?' ], options: [{ text: '1', nextId: 70 },{ text: '2', nextId: 70 },{ text: '3', nextId: 70 },{ text: '4', nextId: 70 },{ text: '5', nextId: 70 },{ text: '6', nextId: 70 },{ text: '7', nextId: 70 },{ text: '8', nextId: 70 },{ text: '9', nextId: 70 },{ text: '10', nextId: 70 }],
    },
    {
        id: 70,
        text: [
            'Voy a proporcionarte el guion para el ejercicio. Recomiendo practicar durante 10-20 minutos diarios. La práctica regular reforzará tus habilidades de relajación, por lo que tendrás más probabilidades de usarla siempre que necesites controlar el estrés.',
            'Comencemos encontrando una posición cómoda, ya sea sentado o acostado, la que te resulte más cómoda. Inhala profundamente y, al exhalar, libera cualquier tensión en tu cuerpo.'
        ],
        options: [{ text: 'OK', nextId: 71 }],
    },
    {
        id: 71,
        text: [
            'Ahora comencemos con un ejercicio de relajación llamado Relajación Muscular Progresiva.',
            '1. Encontrar formas de relajarse y manejar el estrés puede ser muy útil para lidiar con las tensiones de la vida en general y para manejar las relaciones estresantes o si tienes dificultades para conciliar el sueño.',
            '2. También se ha demostrado que las técnicas de relajación reducen el estrés y la tensión. La Relajación Muscular Progresiva está diseñada para relajar los músculos de tu cuerpo enseñándote a tensar y luego relajar varios grupos musculares.',
            '3. Al crear primero tensión y luego liberarla de golpe, puedes producir una mejor reducción de la tensión muscular. La liberación repentina de la tensión crea una especie de energía especial que permite a los músculos relajarse más allá de los niveles normales de reposo.',
            '4. Mueve tu atención a tus pantorrillas y muslos. Tensa los músculos de tus piernas presionando los talones contra el suelo y luego suéltalos. Siente el calor y la relajación que se extienden por tus piernas.',
            '5. Luego, tensa los músculos de tus glúteos apretándolos con fuerza y luego suéltalos. Nota la diferencia entre la tensión y la relajación en tu cuerpo.',
            '6. Ahora, concéntrate en tu estómago. Tensa los músculos abdominales llevando tu ombligo hacia la columna y luego suéltalos. Permite que tu respiración se vuelva profunda y natural.',
            '7. Mueve tu atención a tu pecho y espalda. Inhala profundamente, llenando tus pulmones de aire, y mantén la respiración por un momento. Ahora, exhala lenta y completamente, liberando cualquier tensión en los músculos de tu pecho y espalda.',
            '8. Cambia tu enfoque a tus hombros. Encógelos hacia tus orejas y luego déjalos caer, liberando cualquier tensión que puedas estar reteniendo. Siente el peso de tus hombros hundiéndose en la superficie debajo de ti.',
            '9. Ahora, mueve tu atención a tus brazos y manos. Haz puños con tus manos, apretando con fuerza, y luego suéltalos. Siente cómo la tensión abandona tus brazos mientras los permites volverse pesados y relajados.',
            '10. Finalmente, concéntrate en tu rostro y cuello. Arruga tu cara con fuerza, frunciendo el ceño y entrecerrando los ojos, y luego suéltala. Deja que tu mandíbula se relaje, permitiendo que tus labios se entreabran ligeramente.',
            '11. Tómate un momento para escanear tu cuerpo de la cabeza a los pies, notando cualquier área de tensión restante.',
            '12. Si notas alguna tensión, inhala profundamente y, al exhalar, imagina que esa tensión se derrite, dejándote completamente relajado y en paz.',
            '13. Continúa respirando profundamente y lentamente por unos momentos más, disfrutando de la sensación de relajación en tu cuerpo.',
            '14. Cuando estés listo, abre los ojos suavemente y vuelve al momento presente, sintiéndote renovado y rejuvenecido.'
        ],
        options: [{ text: 'OK', nextId: 72 }],
    },
    {
        id: 72,
        text: [
            'Ahora, en esa misma escala del 1 al 10, ¿dónde calificarías tu nivel de ansiedad? Mostrar números del 1 al 10'
        ],
        options: [{ text: '1', nextId: 73 },{ text: '2', nextId: 73 },{ text: '3', nextId: 73 },{ text: '4', nextId: 73 },{ text: '5', nextId: 73 },{ text: '6', nextId: 73 },{ text: '7', nextId: 73 },{ text: '8', nextId: 73 },{ text: '9', nextId: 73 },{ text: '10', nextId: 73 }],
    },
    {
        id: 73,
        text: [
            '¡Maravilloso! Me alegra que haya ayudado a reducir tu nivel de estrés. Ahora, pasemos al tema principal de hoy, que son las Transiciones de Rol.',
            'Tener un bebé va a cambiar tu vida. Tanto los cambios buenos como los malos pueden ser estresantes, ya que ambos traen nuevas demandas y nuevos horarios.',
            'Piensa en lo estresante que puede ser una boda para una novia. Los grandes cambios, particularmente los estresantes, suelen estar asociados con la depresión. Uno de los períodos de alto riesgo de depresión es cuando las mamás tienen niños muy pequeños en casa.'
        ],
        options: [{ text: 'OK', nextId: 74 }],
    },
    {
        id: 74,
        text: [
            'La buena noticia es que se sabe mucho sobre cómo superar eficazmente los grandes cambios. Hoy, te guiaremos a través de algunas de las herramientas importantes para pensar en este tipo de grandes cambios/transiciones. Tengo información que anticipa las transiciones de rol que discutiremos. ¿Puedes pensar en algún otro ejemplo de cambios que hayas experimentado, los cambios que tuviste que hacer durante un cambio de roles y cómo sobreviviste?'
        ],
        options: [{ text: 'OK', nextId: 75 }],
    },
    {
        id: 75,
        text: [
            'Entiendo y reconozco lo que quieres decir. Ahora hablemos de los cambios que traerá un nuevo bebé a tu vida. Al aumentar nuestra comprensión, podemos esperar hacer un mejor trabajo en satisfacer nuestras necesidades durante este tiempo de cambios.'
        ],
        options: [{ text: 'OK', nextId: 76 }],
    },
    {
        id: 76,
        text: [
            'Comencemos explorando algunas de las pérdidas o cosas que podrías extrañar o tener que cambiar cuando llegue el bebé. ¿Cuáles son algunas de las pérdidas que te vienen a la mente?'
        ],
        options: [{ text: 'OK', nextId: 77 }],
    },
    {
        id: 77,
        text: [
            'Entiendo y reconozco lo que quieres decir. Algunos ejemplos de pérdidas son:-',
            '2. Pérdida de rutina, ya que un bebé interrumpe el horario de 24 horas.',
            '3. Las tareas del hogar no se realizan.',
            '4. Menos tiempo para la pareja, otros hijos, amigos, etc.',
            '5. Pérdida de productividad con la colada, las compras.',
            '6. Menos oportunidades para socializar, lo que lleva al aislamiento.',
            '7. Pérdida de un sentido de propósito al estar en casa durante horas interminables.',
            '8. Incluso pérdida de espacio físico, tener que compartir una habitación con el bebé o mudarse de la situación actual de vivienda.',
            '9. Aislamiento'
        ],
        options: [{ text: 'Siguiente', nextId: 78 }],
    },
    {
        id: 78,
        text: [
            'Es importante reconocer estas pérdidas. Pero también exploremos los beneficios y nuevas oportunidades que podrías ganar como nueva madre. ¿Cuáles son algunas de las cosas que esperas o que crees que pueden ser positivas sobre este cambio?'
        ],
        options: [{ text: 'OK', nextId: 79 }],
    },
    {
        id: 79,
        text: [
            'Eso es genial. Quedarse en casa con un nuevo bebé puede obligarte a:-',
            'Pasar tiempo con tu bebé.',
            'Ver el crecimiento de tu bebé.',
            'Es una oportunidad para disfrutar de las reacciones de tu hijo al mundo.',
            'Reducir tu ritmo, en lugar de llevar una vida agitada.',
            'Aprenderás más sobre ti misma como madre, podrás descubrir algunos talentos ocultos.',
            'Buen pretexto para evitar las tareas domésticas 😊'
        ],
        options: [{ text: 'Siguiente', nextId: 80 }],
    },
    {
        id: 80,
        text: [
            'Es normal tener una variedad de sentimientos con este cambio: ira, miedo, inseguridad. ¿Cuáles son algunos de los sentimientos que te surgen al pensar en estas pérdidas y ganancias?'
        ],
        options: [{ text: 'OK', nextId: 81 }],
    },
    {
        id: 81,
        text: [
            'Esos son sentimientos muy comprensibles. Es importante reconocerlos y no sentirse culpable. Aún podrás disfrutar de la vida, pero es posible que necesites hacerlo de una manera diferente. La regla más importante para sobrevivir a la maternidad es hacer cosas para cuidar tus necesidades. Nutre a la madre.'
        ],
        options: [{ text: 'Siguiente', nextId: 82 }],
    },
    {
        id: 82,
        text: [
            'Ser madre es como ser una jarra de agua: sigues vertiendo, dando y dando mientras cuidas las necesidades a tu alrededor: bebé, familia, amigos, pareja.',
            'Si no tomas medidas para volver a llenar la jarra, pronto estará vacía.',
            'Nadie es una jarra sin fondo. Estar vacío te hará muy vulnerable a la depresión. No puedes ser una buena madre si tus necesidades no están satisfechas. Date permiso.'
        ],
        options: [{ text: 'OK', nextId: 83 }],
    },
    {
        id: 83,
        text: [
            'Pensamientos como “Estoy siendo irritable, débil, mimada, egoísta” seguirán apareciendo en tu mente, pero debes corregirte y pensar “Estoy invirtiendo en mí misma por mi bebé/familia”. Es importante agregar actividades y experiencias positivas cuando estás perdiendo otras cosas positivas que te hacían sentir bien contigo misma. Es natural que te sientas menos motivada y cansada en este momento. Pero agregar deliberadamente actividades positivas puede reducir los sentimientos negativos; puede darte energía.'
        ],
        options: [{ text: 'Siguiente', nextId: 84 }],
    },
    {
        id: 84,
        text: [
            'Hay una relación directa entre las actividades placenteras y el estado de ánimo: cuantas más cosas agradables hagas, mejor te sentirás. Pero debes darte permiso para hacerlo. En la próxima sesión discutiremos algunas de las actividades positivas que podrías verte haciendo una vez que tengas al bebé. ¡Que tengas un gran día! Podemos hablar mañana.'
        ],
        options: [{ text: 'OK', nextId: 85 }],
    },
    {
        id: 85,
        text: [
            '¿Te gustaría continuar con la próxima sesión donde hablaremos sobre Actividades Agradables y Personas Cercanas?'
        ],
        options: [{ text: 'Sí', nextId: 86 },{ text: 'No', nextId: 86 }],
    },

  ],
  'zh-TW': [
{
  id: 1,
  text: [
    '你好，我是 Nayomi。',
    '歡迎來到 nurtur 平台！我們了解即將成為媽媽的獨特挑戰，我們的平臺旨在通過提供經臨床證實的專屬方案來支持你的孕期旅程，以滿足你的需求。',
  ],
  options: [
    { text: '下一步', nextId: 2 }
  ],
},
{
  id: 2,
  text: '完成所有模組後，你將獲得有價值的見解和工具，以更輕鬆地應對產後的複雜問題。我們的計劃基於一個經證實能降低產後憂鬱症風險高達 53% 的方案。',
  options: [
    { text: '下一步', nextId: 3 }
  ],
},
{
  id: 3,
  text: '你的福祉是我們的首要任務，所以如果你有任何問題或需要進一步的協助，請隨時聯繫我們。讓我們一起踏上這段旅程，幫助你優先考慮自我照顧的同時，養育你不斷成長的家庭。',
  options: [
    { text: '下一步', nextId: 4 }
  ],
},
{
  id: 4,
  text: '當你準備好開始時，請告訴我。',
  options: [{ text: '下一步', nextId: 5 }],
},
{
  id: 5,
  text: [
    '在我們開始今天的會話之前，請允許我問幾個問題，以幫助我更好地了解如何更有效地協助你。',
    '在過去的 24 小時內，你有多少次因為對做事情缺乏興趣或快樂而感到困擾？',
    '在 0 到 3 的刻度上：',
    '0 - 完全沒有。',
    '1 - 有時。',
    '2 - 一半時間。',
    '3 - 大部分時間。'
  ],
  options: [{ text: '0', nextId: 6 }, { text: '1', nextId: 6 }, { text: '2', nextId: 6 }, { text: '3', nextId: 6 }],
},
{
  id: 6,
  text: [
    '在過去的 24 小時內，你有多少次因為感到沮喪、憂鬱或絕望而感到困擾？',
    '在 0 到 3 的刻度上：',
    '0 - 完全沒有。',
    '1 - 有時。',
    '2 - 一半時間。',
    '3 - 大部分時間。'
  ],
  options: [{ text: '0', nextId: 7 }, { text: '1', nextId: 7 }, { text: '2', nextId: 7 }, { text: '3', nextId: 7 }],
},
{
  id: 10,
  text: [
    '在過去的 2 週內，你有多少次因為以下問題而感到困擾？',
    '對做事情缺乏興趣或快樂？在 0 到 3 的刻度上：',
    '在 0 到 3 的刻度上：',
    '0 - 完全沒有。',
    '1 - 有時。',
    '2 - 一半時間。',
    '3 - 大部分時間。'
  ],
  options: [{ text: '0', nextId: 11 }, { text: '1', nextId: 11 }, { text: '2', nextId: 11 }, { text: '3', nextId: 11 }],
},
{
  id: 11,
  text: [
    '感到沮喪、憂鬱或絕望？在 0 到 3 的刻度上：',
    '在 0 到 3 的刻度上：',
    '0 - 完全沒有。',
    '1 - 有時。',
    '2 - 一半時間。',
    '3 - 大部分時間。'
  ],
  options: [{ text: '0', nextId: 12 }, { text: '1', nextId: 12 }, { text: '2', nextId: 12 }, { text: '3', nextId: 12 }],
},
{
  id: 12,
  text: [
    '入睡或保持睡眠困難，或過度睡眠？在 0 到 3 的刻度上：',
    '在 0 到 3 的刻度上：',
    '0 - 完全沒有。',
    '1 - 有時。',
    '2 - 一半時間。',
    '3 - 大部分時間。'
  ],
  options: [{ text: '0', nextId: 13 }, { text: '1', nextId: 13 }, { text: '2', nextId: 13 }, { text: '3', nextId: 13 }],
},
{
  id: 13,
  text: [
    '感到疲倦或精力不足？在 0 到 3 的刻度上：',
    '在 0 到 3 的刻度上：',
    '0 - 完全沒有。',
    '1 - 有時。',
    '2 - 一半時間。',
    '3 - 大部分時間。'
  ],
  options: [{ text: '0', nextId: 14 }, { text: '1', nextId: 14 }, { text: '2', nextId: 14 }, { text: '3', nextId: 14 }],
},
{
  id: 14,
  text: [
    '食慾不振或暴飲暴食？在 0 到 3 的刻度上：',
    '在 0 到 3 的刻度上：',
    '0 - 完全沒有。',
    '1 - 有時。',
    '2 - 一半時間。',
    '3 - 大部分時間。'
  ],
  options: [{ text: '0', nextId: 15 }, { text: '1', nextId: 15 }, { text: '2', nextId: 15 }, { text: '3', nextId: 15 }],
},
{
  id: 15,
  text: [
    '對自己感到難過，或覺得自己是個失敗者，或讓自己或家人失望？在 0 到 3 的刻度上：',
    '0 - 完全沒有。',
    '1 - 有時。',
    '2 - 一半時間。',
    '3 - 大部分時間。'
  ],
  options: [{ text: '0', nextId: 16 }, { text: '1', nextId: 16 }, { text: '2', nextId: 16 }, { text: '3', nextId: 16 }],
},
{
  id: 16,
  text: [
    '專注於事情困難，例如閱讀報紙或看電視？在 0 到 3 的刻度上：',
    '0 - 完全沒有。',
    '1 - 有時。',
    '2 - 一半時間。',
    '3 - 大部分時間。'
  ],
  options: [{ text: '0', nextId: 17 }, { text: '1', nextId: 17 }, { text: '2', nextId: 17 }, { text: '3', nextId: 17 }],
},
{
  id: 17,
  text: [
    '行動或說話緩慢到讓其他人注意到。或者，表現得過於煩躁或不安，比平時活動更多？在 0 到 3 的刻度上：',
    '0 - 完全沒有。',
    '1 - 有時。',
    '2 - 一半時間。',
    '3 - 大部分時間。'
  ],
  options: [{ text: '0', nextId: 18 }, { text: '1', nextId: 18 }, { text: '2', nextId: 18 }, { text: '3', nextId: 18 }],
},
{
  id: 18,
  text: [
    '是否有想過自己死去會更好，或是傷害自己？在 0 到 3 的刻度上：',
    '0 - 完全沒有。',
    '1 - 有時。',
    '2 - 一半時間。',
    '3 - 大部分時間。'
  ],
  options: [{ text: '0', nextId: 19 }, { text: '1', nextId: 19 }, { text: '2', nextId: 19 }, { text: '3', nextId: 19 }],
},
{
  id: 19,
  text: [
    '調查顯示你有高水平的壓力。請知道我們在這裡提供幫助。在繼續進行會話之前，請撥打或發送簡訊至國家母嬰心理健康熱線 1-833-TLC-MAMA (1-833-852-6262)。'
  ],
  options: [{ text: '確定', nextId: 47 }],
},
{
  id: 47,
  text: [
    '你是否已經聯絡了列出的電話號碼？'
  ],
  options: [{ text: '是', nextId: 7 }, { text: '否', nextId: 19 }],
},
{
  id: 7,
  text: [
    '謝謝你。我們來開始今天的會話吧。',
    '你好，我是 Nayomi，你的虛擬產前教育者。恭喜你懷孕了！',
  ],
  options: [{ text: '是', nextId: 8 }],
},
{
  id: 8,
  text: [
    '我在這裡支持你參加 ROSE 計劃，即「Reach Out to Social Support and Education」的縮寫。這是一系列旨在教你管理壓力技巧的課程，尤其是在你的寶寶出生後。',
  ],
  options: [{ text: '確定', nextId: 20 }],
},
{
  id: 20,
  text: [
    '擁有寶寶是快樂的時刻，但也可能帶來新的挑戰。我們希望幫助你和你的寶寶有一個良好的開始。每天預留一段時間來完成這些課程可能會很有幫助。',
    '在我們開始之前，請盡量避免任何干擾以保持專注。每次課程大約需要 10 到 15 分鐘，所以你可以根據這個時間來安排。',
  ],
  options: [{ text: '確定', nextId: 21 }],
},
{
  id: 21,
  text: [
    '當你準備好繼續時，請選擇「下一步」。',
  ],
  options: [{ text: '下一步', nextId: 22 }],
},
{
  id: 22,
  text: [
    '每位女性的經歷都不同。有些女性對擁有寶寶感到非常高興，會說她們從未如此幸福。另一些則可能有複雜的感受—有時感覺「非常快樂」，有時卻「感到壓倒性」。對於某些女性來說，這是一種非常有壓力的經歷。然而，沒有人談論這段時間的困難——你需要做出的改變以及成為父母可能是你人生中最艱難的工作之一——這是一份幾乎沒有任何訓練的工作。',
  ],
  options: [{ text: '下一步', nextId: 23 }],
},
{
  id: 23,
  text: [
    '如果你從現實角度來看，你必須把自己的需求放在一邊，你需要餵養、搖晃、換尿布、換衣服，更不用說家裡的日常工作——還有你作為伴侶、女兒、朋友和工作的其他角色。這一切都在你因為缺乏睡眠而感到疲憊不堪，你的身體和荷爾蒙也失去了平衡。聽起來像是一種折磨——其實，缺乏睡眠是眾所周知的一種折磨。這段美好的時光怎麼了！沒有人談論這段經歷的困難。新媽媽感到抱歉抱怨，因為她們有著完美的新媽媽形象，和寶寶一起微笑，充滿喜悅和精力。',
  ],
  options: [{ text: '確定', nextId: 24 }],
},
{
  id: 24,
  text: [
    '你的媽媽曾經告訴過你她剛有你的那幾個月的情況嗎？',
  ],
  options: [{ text: '是', nextId: 25 }, { text: '否', nextId: 36 }],
},
{
  id: 36,
  text: [
    '這是正常的，許多女性因為這段時期可能非常困難而選擇不分享。',
    '確實有些女性不會遇到困難，但如果你問很多問題，大多數女性會告訴你她們在前三個月中的一些困難。我將與你分享一些現實——不是為了嚇唬你，而是為了讓你做好準備，並確保你在寶寶出生後如果遇到困難，不會感到內疚和自責。',
    '如果你沒有準備好，可能會感到驚慌，這會增加你的負面情緒。了解得越多，你會越好。',
  ],
  options: [{ text: '確定', nextId: 26 }],
},
{
  id: 37,
  text: [
    '聽到你在懷孕期間情緒相對穩定的消息真是太好了。每個人的經歷都是獨特的，很高興你在這段時間感到穩定。如果你有任何問題或需要支持，隨時可以聯繫我們。',
    '你知道抑鬱症的症狀嗎？',
  ],
  options: [{ text: '下一步', nextId: 38 }],
},
{
  id: 38,
  text: [
    '了解症狀對每個人來說都很有幫助，無論他們是否親身經歷過。如果你想了解更多症狀或對自己的心理健康或他人的心理健康有任何擔憂，隨時可以詢問。我在這裡隨時提供資訊和支持。現在，我們將深入探討產後抑鬱症，這是一種更嚴重的情況。新媽媽必須意識到這一點。',
  ],
  options: [{ text: '下一步', nextId: 39 }],
},
{
  id: 39,
  text: [
    '在分娩後，產後抑鬱症通常是緩慢而漸進的。它通常發生在頭兩個月內，你可能會開始感覺無法以正確的方式照顧你的寶寶，覺得自己不是一個好媽媽，對自己感到不好，覺得自己是別人的負擔。在照顧寶寶、照顧自己和應對家庭關係方面存在顯著困難。',
  ],
  options: [{ text: '下一步', nextId: 40 }],
},
{
  id: 40,
  text: [
    '大約 10-15% 的新媽媽會出現產後抑鬱症的症狀。這意味著每七位女性中就有一位會經歷產後抑鬱症。對於接受公共援助或經濟困難的女性來說，這種情況更為普遍：約三分之一的此類女性會經歷產後抑鬱症。曾經有抑鬱症發作的女性在分娩後更容易經歷抑鬱症。曾經有產後抑鬱症的女性也更可能再次經歷。',
  ],
  options: [{ text: '下一步', nextId: 41 }],
},
{
  id: 41,
  text: [
    '症狀可能會逐漸開始，但往往會累積，讓新媽媽感到不堪重負、絕望或挫敗。一些常見的想法可能是「我無法以正確的方式照顧寶寶，我不是一個好媽媽，我是別人的負擔。」',
  ],
  options: [{ text: '下一步', nextId: 42 }],
},
{
  id: 42,
  text: [
    '雖然嬰兒藍調是暫時的，但產後抑鬱症的特徵是持續的負面情緒和減少的功能能力。症狀通常持續至少兩週。',
  ],
  options: [{ text: '下一步', nextId: 43 }],
},
{
  id: 43,
  text: [
    '一些常見的徵兆包括感到不堪重負、絕望或對照顧寶寶感到內疚。你也可能會經歷睡眠或飲食困難，或對曾經喜愛的活動失去興趣。',
  ],
  options: [{ text: '下一步', nextId: 44 }],
},
{
  id: 44,
  text: [
    '這可能很可怕，但重要的信息是產後抑鬱症是可以治療的。如果你經歷這些症狀，請立即聯繫你的醫療提供者。',
  ],
  options: [{ text: '下一步', nextId: 31 }],
},
{
  id: 25,
  text: [
    '我很高興聽到你的媽媽跟你分享了這些。',
    '確實有些女性不會遇到困難，但如果你問很多問題，大多數女性會告訴你她們在前三個月中的一些困難。我將與你分享一些現實——不是為了嚇唬你，而是為了讓你做好準備，並確保你在寶寶出生後如果遇到困難，不會感到內疚和自責。如果你沒有準備好，可能會感到驚慌，這會增加你的負面情緒。了解得越多，你會越好。',
  ],
  options: [{ text: '確定', nextId: 26 }],
},
{
  id: 26,
  text: [
    '讓我們來討論產後“藍調”的範圍。女性在寶寶出生後的這段時間感覺會有所不同。對某些人來說，比其他人更糟，持續的時間也更長。正如我們之前所討論的，有些女性會立刻愛上她們的寶寶，感到欣喜若狂並持續快樂，而另一些女性可能會感到非常壓倒。',
  ],
  options: [{ text: '下一步', nextId: 27 }],
},
{
  id: 27,
  text: [
    '大多數新媽媽（約 30-80%）會出現“嬰兒藍調”。嬰兒藍調通常發生在分娩後的兩到五天內。你可能會經歷無緣無故的哭泣、情緒波動、過度敏感、感到壓倒、易怒和疲憊不堪。這是一個非常情緒化的時期，你會感到措手不及。你會想，我有一個美麗、健康的寶寶，我怎麼會感覺想哭？這一階段通常會在幾天到幾週內過去，因為你和你的身體在適應新情況。通常，它會持續約 10 天。',
  ],
  options: [{ text: '下一步', nextId: 28 }],
},
{
  id: 28,
  text: [
    '你在懷孕期間是否經歷過情緒變化？',
  ],
  options: [{ text: '是', nextId: 29 }, { text: '否', nextId: 37 }],
},
{
  id: 29,
  text: [
    '你感受到這些情緒變化是很自然的，謝謝你分享。現在讓我們來談談產後抑鬱症。一些新媽媽經歷了更令人沮喪的時期，這些困難比我們討論的更持久和更強烈。產後抑鬱症是指症狀持續出現，幾乎每天都有，並且至少有兩週沒有緩解。',
    '你知道抑鬱症的徵兆嗎？',
  ],
  options: [{ text: '是', nextId: 30 }, { text: '否', nextId: 38 }],
},
{id:30,text: ['太好了！了解抑鬱的徵兆對於了解你的心理健康和在需要時尋求支持非常重要。如果你對這些徵兆有任何疑問或想進一步討論，隨時詢問。我在這裡提供信息和支持。很高興你對自己的情緒有認識。我們會在未來的課程中討論應對情緒變化的機制。'],options:[{ text: '下一步', nextId: 31 }],},

{id:31,text: ['在我們結束這一節之前，你是否了解「產後憂鬱症」和「產後藍調」的區別？'],options:[{ text: '是', nextId: 32 },{ text: '否', nextId: 45 }],},

{id:32,text: ['做得好！如果你對「產後憂鬱症」和「產後藍調」之間的區別有任何疑問，隨時詢問。我在這裡幫助澄清任何你可能有的疑慮。作為提醒，以下是你應該留意的徵兆：',
'產後藍調 - 30-80% 的人會經歷產後藍調。它通常在分娩後的 2-5 天出現，通常在大約兩週後消失。部分症狀包括：',
'哭泣',
'情緒波動',
'疲憊',
'緊張',
'焦慮',
'不安'],options:[{ text: '下一步', nextId: 33 }],},

{id:33,text: ['產後憂鬱症徵兆：睡眠問題（例如：餵完奶後無法重新入睡）',
'飲食問題 - 吃得太多或太少',
'焦慮和擔憂',
'避免與人接觸，避免接觸寶寶，想要獨處',
'沒有精力',
'死亡念頭，自殺想法',
'對寶寶的積極情感困難',
'做決定困難',
'躁狂 - 感覺迅速，容易激動和易怒，說話快，睡眠需求減少',
'驚恐發作',
'對寶寶的擔憂，幻想傷害或殺死寶寶'],options:[{ text: '下一步', nextId: 34 }],},

{id:34,text: ['如果你感覺自己可能會傷害自己、寶寶或其他人，請立即聯繫你的醫療提供者或撥打 911。'],options:[{ text: '下一步', nextId: 35 }],},

{id:35,text: ['在下一節課中，我們將幫助你了解產後憂鬱症的風險因素、症狀和治療選擇。',
'強調情感的正常性，尋求幫助的重要性，以及在過渡到母職階段時的應對策略和尋求支持的方式。'],options:[{ text: '下一步', nextId: 48 }],},

{id:45,text: ['不用擔心。我們來快速回顧一下。「產後藍調」和「產後憂鬱症」的區別在於它們的持續時間、嚴重程度和對日常功能的影響。「產後藍調」通常是輕微的、短暫的悲傷和情緒波動，發生在分娩後的頭幾週內，通常會自行消失。'],options:[{ text: '確定', nextId: 46 }],},

{id:46,text: ['另一方面，「產後憂鬱症」是一種更為嚴重且持續時間更長的狀況，特徵是持續的悲傷、絕望和焦慮感，這些會顯著干擾母親照顧自己和寶寶的能力。識別徵兆並尋求支持非常重要，如果你或你認識的人可能經歷產後憂鬱症，請尋求幫助。以下是可能有用的列表。'],options:[{ text: '確定', nextId: 32 }]},

// Session 2

{id:48,text: ['如果你想進入下一節，我們將進行放鬆練習和角色過渡，請按確定。'],options:[{ text: '確定', nextId: 49 },{ text: '重複第一節', nextId: 1 }],},

{id:49,text: ['在我們開始今天的課程之前，請讓我問幾個問題，以幫助我更好地了解如何協助你處理問題。',
'在過去 24 小時內，你有多頻繁地感到對做事缺乏興趣或快樂？',
'在 0 到 3 的範圍內：',
'0 - 完全沒有。',
'1 - 有時。',
'2 - 一半時間。',
'3 - 大部分時間。'],options: [{ text: '0', nextId: 50 },{ text: '1', nextId: 50 },{ text: '2', nextId: 50 },{ text: '3', nextId: 50 }],},

{id:50,text: ['在過去 24 小時內，你有多頻繁地感到情緒低落、沮喪或絕望？',
'在 0 到 3 的範圍內：',
'0 - 完全沒有。',
'1 - 有時。',
'2 - 一半時間。',
'3 - 大部分時間。'],options: [{ text: '0', nextId: 51 },{ text: '1', nextId: 51 },{ text: '2', nextId: 51 },{ text: '3', nextId: 51 }],},

{id:51,text: ['在過去 2 週內，你有多頻繁地感到以下問題困擾？',
'對做事缺乏興趣或快樂？在 0 到 3 的範圍內：',
'在 0 到 3 的範圍內：',
'0 - 完全沒有。',
'1 - 有時。',
'2 - 一半時間。',
'3 - 大部分時間。'],options: [{ text: '0', nextId: 52 },{ text: '1', nextId: 52 },{ text: '2', nextId: 52 },{ text: '3', nextId: 52 }],},

{id:52,text: ['感到情緒低落、沮喪或絕望？在 0 到 3 的範圍內：',
'在 0 到 3 的範圍內：',
'0 - 完全沒有。',
'1 - 有時。',
'2 - 一半時間。',
'3 - 大部分時間。'],options: [{ text: '0', nextId: 53 },{ text: '1', nextId: 53 },{ text: '2', nextId: 53 },{ text: '3', nextId: 53 }],},

{id:53,text: ['入睡或維持睡眠困難，或睡得過多？在 0 到 3 的範圍內：',
'在 0 到 3 的範圍內：',
'0 - 完全沒有。',
'1 - 有時。',
'2 - 一半時間。',
'3 - 大部分時間。'],options: [{ text: '0', nextId: 54 },{ text: '1', nextId: 54 },{ text: '2', nextId: 54 },{ text: '3', nextId: 54 }],},

{id:54,text: ['感到疲倦或精力不足？在 0 到 3 的範圍內：',
'在 0 到 3 的範圍內：',
'0 - 完全沒有。',
'1 - 有時。',
'2 - 一半時間。',
'3 - 大部分時間。'],options: [{ text: '0', nextId: 55 },{ text: '1', nextId: 55 },{ text: '2', nextId: 55 },{ text: '3', nextId: 55 }],},

{id:55,text: ['食慾不振或過度進食？在 0 到 3 的範圍內：',
'在 0 到 3 的範圍內：',
'0 - 完全沒有。',
'1 - 有時。',
'2 - 一半時間。',
'3 - 大部分時間。'],options: [{ text: '0', nextId: 56 },{ text: '1', nextId: 56 },{ text: '2', nextId: 56 },{ text: '3', nextId: 56 }],},

{id:56,text: ['對自己感到不好，或認為自己是失敗者或讓自己或家庭失望？在 0 到 3 的範圍內：',
'0 - 完全沒有。',
'1 - 有時。',
'2 - 一半時間。',
'3 - 大部分時間。'],options: [{ text: '0', nextId: 57 },{ text: '1', nextId: 57 },{ text: '2', nextId: 57 },{ text: '3', nextId: 57 }],},

{id:57,text: ['難以專注於事情，例如閱讀報紙或看電視？在 0 到 3 的範圍內：',
'0 - 完全沒有。',
'1 - 有時。',
'2 - 一半時間。',
'3 - 大部分時間。'],options: [{ text: '0', nextId: 58 },{ text: '1', nextId: 58 },{ text: '2', nextId: 58 },{ text: '3', nextId: 58 }],},

{id:58,text: ['動作或說話緩慢到其他人可能注意到，或相反，動作過於頻繁或不安，移動比平時多？在 0 到 3 的範圍內：',
'0 - 完全沒有。',
'1 - 有時。',
'2 - 一半時間。',
'3 - 大部分時間。'],options: [{ text: '0', nextId: 59 },{ text: '1', nextId: 59 },{ text: '2', nextId: 59 },{ text: '3', nextId: 59 }],},

{id:59,text: ['有想過自己會更好死去，或傷害自己？在 0 到 3 的範圍內：',
'0 - 完全沒有。',
'1 - 有時。',
'2 - 一半時間。',
'3 - 大部分時間。'],options: [{ text: '0', nextId: 60 },{ text: '1', nextId: 60 },{ text: '2', nextId: 60 },{ text: '3', nextId: 60 }],},

{id:60,text: ['調查發現高水平的壓力。請知道我們在這裡為你提供幫助。請在繼續進行課程之前撥打或發送簡訊至國家母嬰心理健康熱線 1-833-TLC-MAMA (1-833-852-6262)。'],options: [{ text: '確定', nextId: 61 }],},

{id:61,text: ['你有聯繫上述電話號碼嗎？'],options: [{ text: '有', nextId: 62 },{ text: '沒有', nextId: 60 }],},

{id:62,text: ['歡迎來到第二節課！今天我們將深入探討放鬆練習和角色過渡。',
'根據研究，我們知道曾經經歷過抑鬱症（特別是產後憂鬱症）的女性，在分娩後更可能再次經歷抑鬱症。此外，抑鬱症或有抑鬱症或心理健康問題的家庭成員的歷史，以及支持系統不良的女性也較易經歷抑鬱症。重要的是，這些狀況是可以和應該得到治療的。作為提醒，以下是產後憂鬱症的徵兆：',
'飲食問題 - 吃得太多或太少。',
'焦慮和擔憂。',
'避免與人接觸，避免接觸寶寶，想要獨處。',
'沒有精力。',
'自殺念頭。',
'對寶寶的積極情感困難。',
'做決定困難。',
'躁狂 - 感覺迅速，容易激動和易怒，說話快，睡眠需求減少。',
'驚恐發作。',
'對寶寶的擔憂，幻想傷害或殺死寶寶。'],options: [{ text: '確定', nextId: 63 }],},

{id:63,text: ['如果你有我們討論過的任何徵兆，請與你的醫生、醫療提供者，甚至是寶寶的醫生討論，並要求轉診至心理健康專業人士、治療師、輔導員、社會工作者或精神科醫生。以下是一些資源，請隨時備用：母嬰心理健康熱線、家庭暴力、育兒、法律服務、自殺預防。'],options: [{ text: '確定', nextId: 64 }],},
{
  id: 63,
  text: [
    '從這些課程中帶回家最重要的訊息是，雖然你可能在產後有「產後憂鬱」或甚至抑鬱的感覺，但你不必對這些感受感到羞愧、內疚、認為自己是一個壞媽媽，或覺得自己有什麼不對的地方。'
  ],
  options: [{ text: '好的', nextId: 64 }],
},
{
  id: 64,
  text: [
    '你需要明白，許多這些感受是對新生兒的正常反應。記住：你並不孤單，你沒有錯，而你可以感覺好轉。'
  ],
  options: [{ text: '好的', nextId: 65 }],
},
{
  id: 65,
  text: [
    '同時，談論你的困難是可以的。不要因為和朋友、家人或你的醫療提供者討論你的感受而感到尷尬或害怕。實際上，如果你能和身邊的人談談你的感受，你會感覺好多了。',
    '生小孩是一個重大事件，會影響身體和心理。在這個時候，你需要照顧一個需要你、無助的生命，通常又睡得很少，並且外部幫助也很少。在接下來的幾個課程中，我們將討論如何應對你在生完寶寶後可能經歷的“雲霄飛車般的旅程”。'
  ],
  options: [{ text: '好的', nextId: 66 }],
},
{
  id: 66,
  text: [
    '我無法為你鋪平道路或消除一些壞的顛簸。然而，我們將討論你如何管理憂鬱或低落的時期，以避免陷入抑鬱之中。'
  ],
  options: [{ text: '好的', nextId: 67 }],
},
{
  id: 67,
  text: [
    '我們的ROSE協議方法基於你正面臨一個重大的轉變。我們知道這會需要新的技能並帶來新的要求。面對壓力時，一個主要的問題是擁有良好的支持會非常有幫助。良好的支持可以減少女性在產後產生抑鬱的可能性。不幸的是，雖然你應該得到大量支持，但許多女性驚訝地發現，在這個時期獲得支持並不容易。'
  ],
  options: [{ text: '好的', nextId: 68 }],
},
{
  id: 68,
  text: [
    '和寶寶在一起的需求會減少與他人社交的時間，寶寶的需求可能會對關係造成很大壓力，而其他人可能根本沒有意識到哪些支持或幫助對你會有幫助。因此，我們在nurtur想盡一切可能幫助你感受到你獲得了應得的支持。',
    '我們不能保證這一點，但我們肯定可以幫助你思考對支持的目標，並教你一些有助於這方面的策略。我們將集中探討不同的方法來減輕你生活中的壓力，並談論你生活中的支持者。'
  ],
  options: [{ text: '好的', nextId: 69 }],
},
{
  id: 69,
  text: [
    '在1到10的評分中，1表示沒有焦慮，10表示焦慮非常高，你現在會如何評價自己的焦慮程度？'
  ],
  options: [{ text: '1', nextId: 70 }, { text: '2', nextId: 70 }, { text: '3', nextId: 70 }, { text: '4', nextId: 70 }, { text: '5', nextId: 70 }, { text: '6', nextId: 70 }, { text: '7', nextId: 70 }, { text: '8', nextId: 70 }, { text: '9', nextId: 70 }, { text: '10', nextId: 70 }],
},
{
  id: 70,
  text: [
    '我將為你提供這個練習的指導。我建議每天練習10到20分鐘。定期練習將強化你的放鬆技能，這樣在需要控制壓力時，你會更有可能使用這些技能。',
    '讓我們開始找到一個舒適的姿勢，無論是坐著還是躺下，選擇你覺得最舒服的姿勢。深吸一口氣，然後在呼氣時放鬆你身體的緊張感。'
  ],
  options: [{ text: '好的', nextId: 71 }],
},
{
  id: 71,
  text: [
    '現在讓我們開始一個叫做漸進性肌肉放鬆的放鬆練習。',
    '1. 尋找放鬆和管理壓力的方法在處理生活壓力時非常有幫助，無論是一般的生活壓力，還是面對壓力的關係，或是如果你有入睡困難。',
    '2. 放鬆技巧已經被證明可以減輕壓力和緊張。漸進性肌肉放鬆旨在通過教你緊張然後放鬆不同的肌肉群來放鬆你身體的肌肉。',
    '3. 通過先產生緊張然後瞬間釋放這種緊張，你可以更好地減少肌肉緊張。緊張的突然釋放產生一種特殊的能量，讓肌肉放鬆到甚至超過正常的休息水平。',
    '4. 將注意力轉移到你的小腿和大腿。通過將腳跟壓入地面來緊繃你下腿的肌肉，然後放鬆。感受溫暖和放鬆在你的腿上擴散。',
    '5. 接下來，緊緊收縮你的臀部肌肉，然後放鬆。注意你身體中緊張和放鬆之間的差異。',
    '6. 現在，專注於你的腹部。通過將肚臍向脊柱收縮來緊繃你的腹肌，然後放鬆。讓你的呼吸變得深而自然。',
    '7. 將注意力轉移到你的胸部和背部。深吸一口氣，讓空氣充滿你的肺部，停留一會兒。現在，慢慢完全呼氣，釋放你胸部和背部肌肉的緊張。',
    '8. 將注意力移向你的肩膀。聳肩至耳朵，然後讓它們自然下落，釋放你可能保持的緊張。感受肩膀的重量沉入下面的表面。',
    '9. 現在，移至你的手臂和手。握緊拳頭，用力捏緊，然後放鬆。感受緊張從你的手臂中釋放，讓它們變得沉重和放鬆。',
    '10. 最後，專注於你的臉和脖子。緊皺你的臉，皺眉和瞇眼，然後放鬆。讓你的下巴放鬆，嘴唇微微分開。',
    '11. 花點時間從頭到腳掃描你的身體，注意任何剩餘的緊張區域。',
    '12. 如果你注意到任何緊張，深吸一口氣，然後在呼氣時想像那緊張化為烏有，讓你感到完全放鬆和輕鬆。',
    '13. 繼續深呼吸幾個瞬間，享受你身體中的放鬆感。',
    '14. 當你準備好時，輕輕睜開眼睛，回到當下，感覺神清氣爽。'
  ],
  options: [{ text: '好的', nextId: 72 }],
},
{
  id: 72,
  text: [
    '現在，在同樣的1到10的評分中，你會如何評價自己的焦慮程度？顯示數字1到10'
  ],
  options: [{ text: '1', nextId: 73 }, { text: '2', nextId: 73 }, { text: '3', nextId: 73 }, { text: '4', nextId: 73 }, { text: '5', nextId: 73 }, { text: '6', nextId: 73 }, { text: '7', nextId: 73 }, { text: '8', nextId: 73 }, { text: '9', nextId: 73 }, { text: '10', nextId: 73 }],
},
{
  id: 73,
  text: [
    '太好了！我很高興這幫助你降低了壓力水平。現在，讓我們進入今天的主題：角色轉變。',
    '生小孩會改變你的生活。好的和壞的改變都可能會帶來壓力，因為兩者都會帶來新的要求和新日程。',
    '想想婚禮對新娘來說有多麼有壓力。特別是壓力大的重大變化，通常與抑鬱相關。對於有非常年幼孩子的媽媽來說，抑鬱的高風險期之一就是這段時間。'
  ],
  options: [{ text: '好的', nextId: 74 }],
},
{
  id: 74,
  text: [
    '好消息是，對於如何有效度過重大變化已經有了很多了解。今天，我們將引導你使用一些重要工具來思考這類重大變化/轉變。我有一些信息可以預覽我們將要討論的角色轉變。你能想到其他經歷過的變化、在角色變化期間需要做出的變化以及你如何度過的例子嗎？'
  ]
},
{
  id: 75,
  text: [
    '我理解並認可你的意思。現在讓我們談談新生兒將在你的生活中帶來的變化。通過增進理解，我們希望在這段動蕩的時期能更好地滿足自己的需求。'
  ],
  options: [{ text: '好的', nextId: 76 }],
},
{
  id: 76,
  text: [
    '讓我們開始探討當寶寶來臨時你可能會失去的東西或必須改變的事物。你想到的損失有哪些？'
  ]
},
{
  id: 77,
  text: [
    '我理解並認可你的意思。一些損失的例子包括：-',
    '2. 失去常規，因為寶寶打亂了24小時的時間表',
    '3. 家務無法完成',
    '4. 和伴侶、其他孩子、朋友等的時間變少',
    '5. 生產力下降，例如洗衣、購物。',
    '6. 社交機會減少，導致孤立。',
    '7. 長時間待在家中失去的目標感。',
    '8. 甚至失去物理空間，需要與寶寶共用房間或搬出當前的居住環境。',
    '9. 孤立感'
  ],
  options: [{ text: '下一步', nextId: 78 }],
},
{
  id: 78,
  text: [
    '承認這些損失是重要的。但讓我們也探索一下作為新媽媽你可能獲得的好處和新機會。你期待什麼，或者你認為這一變化中有哪些積極的方面？'
  ]
},
{
  id: 79,
  text: [
    '那真好。在家帶新生兒可能會迫使你：-',
    '與寶寶共度時光。',
    '觀察寶寶的成長。',
    '這是一個享受孩子對世界反應的機會。',
    '放慢腳步，而不是過著忙碌的生活。',
    '你會更了解自己作為母親，可能會發現一些潛在的才能。',
    '這也是個很好的藉口可以逃避家務 😊'
  ],
  options: [{ text: '下一步', nextId: 80 }],
},
{
  id: 80,
  text: [
    '在這一變化中擁有各種情感是正常的——憤怒、恐懼、不安全感。當你思考這些損失和收穫時，有哪些情感浮現出來？'
  ]
},
{
  id: 81,
  text: [
    '這些情感非常可以理解。承認它們是重要的，不要感到內疚。你仍然可以享受生活，但你可能需要以不同的方式來實現。在母職生存中的最重要法則是照顧自己的需求。滋養母親。'
  ],
  options: [{ text: '下一步', nextId: 82 }],
},
{
  id: 82,
  text: [
    '成為母親就像是一壺水——你不斷地倒出水，給予周圍的需求——寶寶、家人、朋友、伴侶。',
    '如果你不採取行動讓水壺再次滿起來，很快它就會是空的。',
    '沒有人是一個無底的水壺。空的狀態會讓你非常容易受到抑鬱的侵襲。如果你的需求得不到滿足，你無法成為一個好的父母。給自己一個允許。'
  ],
  options: [{ text: '好的', nextId: 83 }],
},
{
  id: 83,
  text: [
    '像“我很脾氣暴躁、虛弱、被寵壞、自私”的想法會不斷在你的腦海中出現，但你必須修正自己，想著“我是在為我的寶寶/家庭投資”。在你失去其他讓你感覺良好的積極事物時，增加積極的活動和經驗是很重要的。在這段時間裡你會自然地感到動力減少和疲倦，但故意增加積極的活動可以減少消極情緒——它可以讓你充滿活力。'
  ],
  options: [{ text: '下一步', nextId: 84 }],
},
{
  id: 84,
  text: [
    '愉快的活動與情緒之間有直接關係，你做的愉快事物越多，你的感覺可能越好。但你必須給自己這樣做的許可。在下一次會議中，我們將討論一些你在有了寶寶後可能會做的積極活動。祝你有美好的一天！我們明天可以聊。'
  ],
  options: [{ text: '好的', nextId: 85 }],
},
{
  id: 85,
  text: [
    '你想要繼續進入下一次會議，我們將討論愉快的活動和親近的人嗎？'
  ],
  options: [{ text: '是', nextId: 86 }, { text: '否', nextId: 86 }],
}



  ]
};
