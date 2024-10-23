import React from "react";
import "../stylesheets/fileupload.css";
export interface FileUploadProps {
    valid_file_types?: string[];
    thread_id?: string;
    max_size?: number;
    onFileUpload?: (
        formInput: HTMLInputElement & EventTarget,
        thread_id: string,
        max_size: number,
        onSuccess: (successMessage?: JSX.Element) => void,
        onError: (error: Response | Error, errorMessage?: JSX.Element) => void) => Promise<boolean>;
    onSuccess?: (successMessage?: JSX.Element) => void;
    onError?: (error: Response | Error, errorMessage?: JSX.Element) => void;
    defaultOnErrorMessage?: JSX.Element;
    defaultOnSuccessMessage?: JSX.Element;
};

const FileUpload = (props: FileUploadProps) => {
    let { valid_file_types, thread_id, max_size, onFileUpload, onSuccess, onError } = props;
    if (valid_file_types === undefined) {
        valid_file_types = file_types;
    }
    if (thread_id === undefined) {
        thread_id = "";
    }
    if (max_size === undefined) {
        max_size = 500;
    }
    if (onFileUpload === undefined) {
        onFileUpload = _uploadFile;
    }
    if (onSuccess === undefined) {
        onSuccess = _onSuccess;
    }
    if (onError === undefined) {
        onError = (error) => { _onError(error); };
    }
    else {
        onError = (error) => { props.onError && props.onError(error, props.defaultOnErrorMessage); };
    }
    return (
        <>
            <div className="upload-container">
                <form id="file-upload-form" className="uploader" >
                    <label htmlFor="file-upload" id="file-drag">
                        <div id="upload-image-group">
                            <img src="./assets/upload.svg" alt="upload file" id="upload-image" />
                            <div id="upload-image-mask"></div>
                        </div>
                    </label>
                    <input type="file"
                        id="file-upload"
                        accept={valid_file_types.join(',')}
                        onInput={async (e) => { if (onFileUpload && onSuccess && onError) await onFileUpload(e.currentTarget, thread_id ?? "", max_size ?? 512000 * 2, onSuccess, onError); }}></input>
                </form>
            </div>
        </>
    )
}

const file_types = ['c', 'cpp', 'csv', 'docx', 'html', 'java', 'json', 'md', 'pdf', 'php', 'pptx', 'py', 'rb', 'tex', 'txt', 'css', 'jpeg', 'jpg', 'js', 'gif', 'png', 'tar', 'ts', 'xlsx', 'xml', 'zip'];
const _uploadFile = async function (
    fileInput: HTMLInputElement & EventTarget,
    thread_id: string,
    max_size: number,
    onSuccess: () => void,
    onError: (response: Response | Error) => void) {
    const mask = document.getElementById("upload-image-mask");
    if (mask !== null) {
        mask.style.display = "block";
    }
    const file = fileInput.files;
    if (file !== null && file.length !== 0) {
        if (fileInput !== null) {
            fileInput.checkValidity();
            if (file[0].size > max_size * 1000000) {
                alert(`File is too big! must be less than ${max_size}MB`);
                if (mask !== null) {
                    mask.style.display = "none";
                }
                const formData = new FormData();
                formData.append('file', file[0]);
                fetch("/upload", {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Dash2Labs-Thread-Id': thread_id,
                        'Access-Control-Allow-Origin': '*'
                    }
                }).then((response) => {
                    if (response.status === 200 && response.type !== 'opaque') {
                        onSuccess();
                        return;
                    }
                    else if (response.status === 200 && response.type === 'opaque') {
                        return;
                    }
                    else {
                        onError(response);
                    }
                }).catch((error: Error) => {
                    if (error instanceof Error) {
                        console.error(error);
                    }
                    onError(error);
                }).finally(() => {
                    if (mask !== null) {
                        mask.style.display = "none";
                    }
                });
            }
        }
    }
    return true;
}

const _onError = (error: Response | Error) => {
    if (error instanceof Response) {
        console.error(error.body);
        alert(`Error uploading file: ${error.statusText}`);
        return;
    } else if (error instanceof Error) {
        console.error(error.message);
        alert(`Error uploading file: ${error.message}`);
        return;
    }
    alert("Error uploading file");
}

const _onSuccess = () => {
    alert("File uploaded successfully");
}


export default FileUpload;