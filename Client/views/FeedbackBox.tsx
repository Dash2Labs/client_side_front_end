import React, { useState, useEffect } from 'react';
import { submitFeedback } from '../controllers/feedbackHandler';

type FeedbackBoxProps = {
    questionResponsePairs: { question: string; response: string , responseTime: any}[];
    feedbackSubmitted: boolean;
    setFeedbackSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
};

const FeedbackBox: React.FC<FeedbackBoxProps> = ({ questionResponsePairs, feedbackSubmitted ,setFeedbackSubmitted}) => {
    
    const [selectedFeedback, setSelectedFeedback] = useState<string | null>(null);
    const [showFeedbackInput, setShowFeedbackInput] = useState(false);
    const [textFeedback, setTextFeedback] = useState('');
    const [submitTimer, setSubmitTimer] = useState<NodeJS.Timeout | null>(null);
    const [submitClicked, setSubmitClicked] = useState(false);
    const [previousSelectedFeedback, setPreviousSelectedFeedback] = useState<string | null>(null);


    const feedbackOptions = [
        { id: 'bad', emoji: '😠', label: 'Bad' },
        { id: 'poor', emoji: '😕', label: 'Poor' },
        { id: 'neutral', emoji: '😐', label: 'Neutral' },
        { id: 'decent', emoji: '🙂', label: 'Decent' },
        { id: 'good', emoji: '😊', label: 'Good' },
        { id: 'text', emoji: '💬', label: 'Leave text feedback' },
    ];
    useEffect(() => {
        setPreviousSelectedFeedback(selectedFeedback);
    }, [selectedFeedback]);

    useEffect(() => {
        const submitEmojiFeedback = () => {
            if (!submitClicked && !feedbackSubmitted) {
                if (questionResponsePairs.length > 0) {
                    submitFeedback('No Text', selectedFeedback as string, questionResponsePairs[questionResponsePairs.length - 1].question, questionResponsePairs[questionResponsePairs.length - 1].response, questionResponsePairs[questionResponsePairs.length - 1].responseTime);
                } else {
                    submitFeedback('No Text', selectedFeedback as string, 'No question', questionResponsePairs[questionResponsePairs.length - 1].response, questionResponsePairs[questionResponsePairs.length - 1].responseTime);
                }
                setSelectedFeedback(''); 
                setFeedbackSubmitted(true); 
            }
        };
        const checkAndSubmitFeedback = () => {
            if (!submitClicked && !showFeedbackInput) {
                submitEmojiFeedback();
            } else if (showFeedbackInput) {
                const additionalTimer = setTimeout(() => {
                    if (selectedFeedback !== previousSelectedFeedback && !submitClicked && !feedbackSubmitted && !showFeedbackInput) {
                        submitEmojiFeedback(); 
                    } else {
                        checkAndSubmitFeedback();
                    }
                }, 30000);
                setSubmitTimer(additionalTimer);
            }
        };
        if (selectedFeedback && selectedFeedback !== 'text' && !submitClicked) {
            const timer = setTimeout(() => {
                checkAndSubmitFeedback();
            }, 60000);
            setSubmitTimer(timer);
        }
        return () => {
            if (submitTimer) {
                clearTimeout(submitTimer);
            }
        };
    }, [selectedFeedback, submitClicked, showFeedbackInput, questionResponsePairs]);
    
    

    
    const handleFeedbackSelection = (id: string) => {
        if (id === 'text') {
            setShowFeedbackInput(!showFeedbackInput);
        } else {
    
            setSelectedFeedback(id);
            setShowFeedbackInput(false);
            setSubmitClicked(false);
        }
    };

    const handleTextFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setTextFeedback(e.target.value);
    };

    const submitTextFeedback = async () => {
        try {
            setSubmitClicked(true); 
            submitFeedback(textFeedback as string, selectedFeedback as string, questionResponsePairs[questionResponsePairs.length - 1].question, questionResponsePairs[questionResponsePairs.length - 1].response, questionResponsePairs[questionResponsePairs.length - 1].responseTime);
            setTextFeedback('');
            setSelectedFeedback(null);
            setShowFeedbackInput(false);
            setFeedbackSubmitted(true); 
        } catch (error) {
            console.error('Error submitting feedback:', error);
        }
    };

    return (
        <div className="feedback-box">
            {feedbackOptions.map((option) => (
                <button
                    key={option.id}
                    className={`feedback-option ${selectedFeedback === option.id ? 'selected' : ''}`}
                    onClick={() => handleFeedbackSelection(option.id)}
                    aria-label={option.label}
                >
                    {option.emoji}
                </button>
            ))}
            {showFeedbackInput && (
                <div>
                    <textarea
                        value={textFeedback}
                        onChange={handleTextFeedbackChange}
                        placeholder="Type your feedback here..."
                        rows={6} 
                        style={{ width: '100%', marginTop: '10px' }} 
                    ></textarea>
                    <button onClick={submitTextFeedback}>Submit</button>
                </div>
            )}
        </div>
    );
};

export default FeedbackBox;
