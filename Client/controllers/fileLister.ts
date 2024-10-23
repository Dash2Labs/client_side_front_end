export const getFileList = async () => {
    try {
        const fileList = await fetch(`/api/getFileList`)
            .then(response => response.json())
            .then(data => {
                return data.files;
            })
            .catch(reason => { throw new Error(reason) })
        return fileList;
    } catch (err) {
        console.error("Error: " + err);
        return ["Could not retrieve file list"];
    }
};

export const deleteFile = async (fileId: string) => {
    try {
        const result = await fetch(`/api/deleteFile/${fileId}`, { method: "DELETE" })
            .then(response => { if (response.status >= 200 || response.status < 300) { return true; } else { return false; } })
            .catch(reason => { throw new Error(reason) })
        return false;
    } catch (err) {
        console.error("Error: " + err);
        return false;
    }
};