export type GreetingProps = {
    botIcon?: string,
    suggestions: SuggestionProps,
    children?: React.ReactNode
};

export type SuggestionProps = {
    suggestion1Title: string,
    suggestion1Subtitle: string,
    suggestion2Title: string,
    suggestion2Subtitle: string,
    suggestion3Title: string,
    suggestion3Subtitle: string,
    suggestion4Title: string,
    suggestion4Subtitle: string,
};

export type ChatFileList = {
    file_id: string;
    file_name: string;
};

export type FileListerModalProps = {
    fileList: ChatFileList[],
}

export type ChatboxProps = {
    profileIcon: string,
    greeting: GreetingProps,
    logo: string
};