import axios from 'axios';

export default class ChunkFileUpload {

    findFileById = (id) => {
        let element = document.getElementById(id);
        return element.files[0];
    };

    processFile = (postUrl, file) => {

        const size = file.size;
        const sliceSize = 1024 * 512;
        let start = 0;

        const now = (new Date()).getTime();

        let listOfAxiosPosts = [];

        let fm = {
            fileName: file.name,
            timestamp: `${now}`,
            base64StringFile: null,
            start: 0,
            end: 0
        };

        return new Promise((resolve, reject) => {
            const loop = () => {
                let end = start + sliceSize;

                if (size - end < 0) {
                    end = size;
                }
                fm.start = start;
                fm.end = end;

                this.createChunk(file, start, end, fm).then((fm) => {
                    listOfAxiosPosts.push(
                        axios.post(postUrl, fm)
                            .catch(() => {
                                reject({
                                    timestamp: now,
                                    fileName: file.name
                                });
                            })
                    );
                    if (end < size) {
                        start += sliceSize;
                        setTimeout(loop, 1);
                    } else {
                        axios.all(listOfAxiosPosts)
                            .then(axios.spread(function (acct, perms) {
                                resolve({
                                    timestamp: now,
                                    fileName: file.name
                                });
                            }))
                            .catch(() => {
                                reject({
                                    timestamp: now,
                                    fileName: file.name
                                });
                            });
                    }

                }).catch(() => {
                    reject({
                        timestamp: now,
                        fileName: file.name
                    });
                });
            };

            setTimeout(loop, 1);
        });
    };

    createChunk = (file, start, end, fm) => {
        let copyFm = JSON.parse(JSON.stringify(fm));
        copyFm.start = start;
        copyFm.end = end;

        const blob = this.slice(file, start, end);
        let reader = new FileReader();
        return new Promise((resolve, reject) => {
            reader.onerror = () => {
                reader.abort();
                reject(new Error("Error parsing file"));
            };
            reader.onload = function () {
                let bytes = Array.from(new Uint8Array(reader.result));

                copyFm.base64StringFile = btoa(bytes.map((item) => String.fromCharCode(item)).join(""));

                resolve(copyFm);
            };
            reader.readAsArrayBuffer(blob);
        });
    };

    /**
     * Formalize file.slice
     */
    slice = (file, start, end) => {
        const slice = file.mozSlice ? file.mozSlice :
            file.webkitSlice ? file.webkitSlice :
                file.slice ? file.slice : this.noop;

        return slice.bind(file)(start, end);
    };

    noop = () => {
        console.error("slice for file is not possible");
    }
}