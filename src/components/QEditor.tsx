import React, { useState } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

interface Props {
    value: string
    setValue: (val: string) => void
    setFocus: (val: number) => void
}

const QEditor = ({ value, setValue, setFocus }: Props) => {
    var toolbarOptions = [
        ["bold", "italic", "underline", "strike"], // toggled buttons
        ["blockquote", "code-block"],

        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: "ordered" }, { list: "bullet" }],
        [{ script: "sub" }, { script: "super" }], // superscript/subscript
        [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
        [{ direction: "rtl" }], // text direction

        [{ size: ["small", false, "large", "huge"] }], // custom dropdown
        [{ header: [1, 2, 3, 4, 5, 6, false] }],

        [{ color: [] }, { background: [] }], // dropdown with defaults from theme
        [{ align: [] }],

        ["clean"], // remove formatting button
    ]
    const module = {
        toolbar: toolbarOptions,
    }

    return (
        <ReactQuill
            modules={module}
            theme="snow"
            value={value}
            onChange={setValue}
            className="rounded-lg"
            onFocus={() => setFocus(4)}
        />
    )
}

export default QEditor
