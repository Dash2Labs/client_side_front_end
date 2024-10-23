import React, { useState, useEffect, lazy, Suspense, startTransition } from 'react';
import { MsalAuthenticationTemplate } from "@azure/msal-react";
import { InteractionType } from "@azure/msal-browser";
import { loginRequest } from "../controllers/auth/authConfig";
import FeedbackBox from './FeedbackBox'; 
import { ChatboxProps, ChatFileList } from '../props';
import { handleUserQuery } from '../controllers/chatHandler';
import FileUpload from './FileUpload';
import { FileLister, FileListerModal, DeleteDialog } from './FileLister';
import { Loading } from './ui-components/Loading';
import { ErrorComponent } from './ui-components/ErrorComponent';
import Header from './heading'; 
import Sidebar from './sidebar';
//const GREETING = lazy(() => (import('./greeting')));
const HistoryComponent = lazy(() => (import('./history')));
const Spinner = lazy(() => (import('./spinner')));
import '../stylesheets/chatbox.css';
import WelcomeName from './ui-components/WelcomeName';
import LogoutComponent from './ui-components/LogoutComponent';
import { ErrorBoundary } from './ErrorBoundary';
import { getProfile } from '../controllers/auth/msgraphapi';
import { constants } from "../constants.js";

const CHATBOX = (props: ChatboxProps) => {
    const authRequest = {
        ...loginRequest
    };

    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackKey, setFeedbackKey] = useState(0);

    const handleShowFeedbackBar = () => {
        setShowFeedback(true);
    };

    const resetFeedbackBox = () => {
        setFeedbackKey(prevKey => prevKey + 1);
        setShowFeedback(false); // Optionally hides and then shows the FeedbackBox for the next interaction
    };

    const [questionResponsePairs, setQuestionResponsePairs] = useState([]);


    const { greeting, profileIcon, logo} = props;
    const { botIcon, suggestions } = greeting;
    let showGreeting = true;
    // Initialize variables with history from local storage or empty string
    const [fileList, setFileList] = useState<ChatFileList[]>([]);
    const [history, setHistory] = useState(() => {
        return localStorage.getItem("history") || ""
    });
    const [threadId, setThreadId] = useState(() => {
        return localStorage.getItem("threadId") || "";
    });
    // if thread_id is changed, update thread_id
    useEffect(() => {
        localStorage.setItem("threadId", threadId);
    }, [threadId]);
    // if history is changed, update history
    useEffect(() => {
        localStorage.setItem("history", history);
    }, [history]);
    if (history.length !== 0) {
        showGreeting = false;
    };
    return (
        <>
            <ErrorBoundary>
                <Suspense fallback={<Loading></Loading>}>
                    <MsalAuthenticationTemplate
                        interactionType={InteractionType.Popup}
                        authenticationRequest={authRequest}
                        errorComponent={ErrorComponent}
                        loadingComponent={Loading}
                    > 
                        <div className="header">
                            <WelcomeName />
                            <LogoutComponent />
                            <div className='logo'>
                                <Header img={constants.customer_logo}/>
                            </div>
                        </div>

                        <div id="chat-container" className="chat-layout">
                            <Sidebar /> 
                            <div id="chat-content">
                                <div>
                                    <FileListerModal fileList={fileList}></FileListerModal>
                                    <DeleteDialog></DeleteDialog>
                                </div>
                                <div id="chat-box">
                                    {showGreeting ?
                                        <div id="chat"></div>
                                        :
                                        <div id="chat">
                                            <HistoryComponent history={history} />
                                            {showFeedback && <FeedbackBox 
                                            key={feedbackKey}
                                            questionResponsePairs={questionResponsePairs}
                                            feedbackSubmitted={feedbackSubmitted}
                                            setFeedbackSubmitted={setFeedbackSubmitted} />}
                                        </div>}
                                </div>
                                <ChatInput
                                    setHistory={setHistory}
                                    history={history}
                                    threadId={threadId}
                                    setThreadId={setThreadId}
                                    botIcon={botIcon}
                                    setFileList={setFileList}
                                    defaultProfileIcon={profileIcon}
                                    showFeedbackBar={handleShowFeedbackBar}
                                    resetFeedbackBox={resetFeedbackBox}
                                    setQuestionResponsePairs={setQuestionResponsePairs}
                                    setFeedbackSubmitted={setFeedbackSubmitted}
                                />
                            </div>
                        </div >
                    </MsalAuthenticationTemplate>
                </Suspense>
            </ErrorBoundary>
        </>
    );
};

type ChatInputProps = {
    setHistory: React.Dispatch<React.SetStateAction<string>>;
    history: string;
    threadId: string;
    setThreadId: React.Dispatch<React.SetStateAction<string>>;
    botIcon: string | undefined;
    setFileList: React.Dispatch<React.SetStateAction<ChatFileList[]>>;
    defaultProfileIcon: string;
    children?: React.ReactNode;
    showFeedbackBar: () => void;
    resetFeedbackBox: () => void;
    setQuestionResponsePairs: React.Dispatch<React.SetStateAction<{ question: string; response: string }[]>>;
    setFeedbackSubmitted: React.Dispatch<React.SetStateAction<boolean>>;
};

const ChatInput = (props: ChatInputProps) => {
    const { setHistory, history, threadId, setThreadId, botIcon, setFileList, defaultProfileIcon , setFeedbackSubmitted} = props;
    const [showSpinner, setShowSpinner] = useState("none");
    const [profileIcon, setProfileIcon] = useState<string | undefined>(undefined);

    useEffect(() => {
        getProfileIcon(defaultProfileIcon, setProfileIcon);
    }, [defaultProfileIcon]);
    return (
        <div className="input-box">
            <form>
                <input type="text" placeholder="Ask a question" id="chat-input" onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        const lu = localStorage.getItem("lastUsed") || "";
                        setShowSpinner("block");
                        props.resetFeedbackBox();
                        handleUserQuery(
                            e.currentTarget.value, // question  
                            threadId, // threadId
                            history, // history
                            setHistory, // setHistory
                            profileIcon === undefined ? defaultProfileIcon : profileIcon, // profileIcon
                            botIcon ?? "", // botIcon
                            setThreadId, // setThreadId
                            (question: string, response: string, responseTime: number) => {
                                const newPair = { question, response, responseTime };
                                props.setQuestionResponsePairs((prevPairs) => [...prevPairs, newPair]);
                            },
                            props.setFeedbackSubmitted, // setFeedbackSubmitted
                            setShowSpinner // setShowSpinner
                        );
                        const handleShowFeedbackBar = () => {
                            props.showFeedbackBar();
                        };

                        handleShowFeedbackBar();
                        e.currentTarget.value = "";
                    }
                }}></input>
            </form>
        </div>);
};

const getProfileIcon = async (defaultProfileIcon: string, setProfileIcon: any) => {
    await getProfile(null)
        .then((profile) => {
            if (profile !== undefined && profile !== null && profile !== "")
                setProfileIcon(profile);
            else
                setProfileIcon(defaultProfileIcon);
        })
        .catch((error) => {
            setProfileIcon(defaultProfileIcon);
        });
}
const valid_file_types = ['c', 'cpp', 'csv', 'docx', 'html', 'java', 'json', 'md', 'pdf', 'php', 'pptx', 'py', 'rb', 'tex', 'txt', 'css', 'jpeg', 'jpg', 'js', 'gif', 'png', 'tar', 'ts', 'xlsx', 'xml', 'zip'];
export default CHATBOX;
