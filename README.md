# chunk-file-upload

Version 0.1.alpha

Idea:
transmit chunks of files from browser to server. 
After successful transmission, start a last Request and instructs the server 
to concat the chunks in a complete file.

Working but not really tested version to upload chunks of a file from browser to server.

```javascript
onChange = () => {
let uploader = new ChunkFileUpload();

let file = uploader.findFileById('file-input');

uploader.processFile('/store.php', file).then((fm) => {
    // start a last call to start the concat process
}).catch(() => {
    alert('Not successful');
});
};
```

```
<input id="file-input" type="file" onChange={this.onChange}/>
```