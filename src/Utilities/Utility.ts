function getSizeInBytes(obj: any): number {
    const str = JSON.stringify(obj);
    return new Blob([str]).size;
}

export { getSizeInBytes };