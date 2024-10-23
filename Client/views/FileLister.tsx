import React from "react";
import { getFileList, deleteFile } from "../controllers/fileLister";
import { ChatFileList, FileListerModalProps } from "../props";

type FileListerProps = {
    setFileList: (fileList: ChatFileList[]) => void;
};
export const FileLister = ({ setFileList }: FileListerProps) => {
    return (
        <div className="file-lister-icon" role="button" onClick={() => (openFileListModal("file-modal", setFileList))}><img src="./assets/filelist.svg" alt="file lister" /></div>
    );
};

const openFileListModal = async (modalId: string, setFileList: (fileList: ChatFileList[]) => void) => {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "block";
    }
    let fileList: ChatFileList[] = await getFileList()
        .then((response) => { return response; })
        .catch((error) => { return [{ file_id: "", file_name: "" }]; });
    setFileList(fileList);
};

const closeFileListModal = (modalId: string) => {
    let modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = "none";
    }
};

const showDeleteDialog = (file: { file_id: any; file_name?: string; }) => {
    let dialog = document.getElementById("delete-dialog");
    if (dialog) {
        dialog.style.display = "block";
    }
    let modal = document.getElementById("file-modal");
    if (modal) {
        modal.style.display = "none";
    }
    let deleteButton = document.getElementById("delete-button");
    if (deleteButton) {
        deleteButton.onclick = () => {
            deleteFile(file.file_id);
            closeDeleteDialog("delete-dialog");
        };
    }
}

export const DeleteDialog = () => {
    return (
        <div id="delete-dialog" className="delete-dialog">
            <div className="delete-dialog-content">
                <span className="close" onClick={() => (closeDeleteDialog("delete-dialog"))}>&times;</span>
                <p>Are you sure you want to delete this file?</p>
                <button id="delete-button">Delete</button>
            </div>
        </div>
    );
};

const closeDeleteDialog = (dialogId: string) => {
    let dialog = document.getElementById(dialogId);
    if (dialog) {
        dialog.style.display = "none";
    }
}

export const FileListerModal = (props: FileListerModalProps) => {
    return (
        <div id="file-modal" className="file-modal">
            <div className="file-modal-content">
                <span className="close" onClick={() => (closeFileListModal("file-modal"))}>&times;</span>
                <ul>
                    {Array.isArray(props.fileList) && props.fileList.map((file: ChatFileList) => {
                        return (
                            <li key={file.file_id}>
                                <div className="file-list-item"><p>{file.file_name}</p><div role="button" onClick={(e) => { showDeleteDialog(file); }}><img src="assets/trashcan.svg"></img></div></div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}