import '../../../../styles/editor.css'
import { useUserContext } from "@/app/context/user";
import { changeVisibilty, updateNote } from "@/app/lib";
import { getHTML } from "@/app/lib/getHTML";
import MenuBar from "@/app/components/Menubar";
import Tags from "@/app/components/Tags";
import TipTap from "@/app/components/TipTap";
import { Tag, User } from "@/app/types";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { BsLockFill, BsUnlockFill } from "react-icons/bs";
import { useEffect, useState } from "react"
import { MdSave, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import api from '../../../../../../utils/api';

type EditorProps = {
  content: string | undefined,
  title: string | undefined,
  noteid: string
  tags: Tag[]
  suggestions: Tag[]
  visibility: boolean
}

const Editor = (props: EditorProps) => {
  const { current_user }: { current_user: User } = useUserContext()
  const [title, setTitle] = useState(props.title === undefined ? "" : props.title);
  const [isEditable, setIsEditable] = useState(true);
  const [isPrivate, setIsPrivate] = useState(props.visibility)

  const [tags, setTags] = useState<Tag[]>(props.tags);

  const [suggestions, setSuggestions] = useState<Tag[]>(props.suggestions);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write something …",
      }),
    ],
    content: props.content === undefined ? `` : props.content
  });


  useEffect(() => {
    //* If editable is true then show bubble menu
    if (editor) {
      editor.setEditable(isEditable);
    }
  }, [isEditable, editor]);

  const save = async () => {
    //Create Save function to update a note
    const content = getHTML(editor)
    const updatedNote = {
      title,
      content,
      author: current_user.username,
      tags: tags.map(item => item.name)
    }
    try {
      const response = await api.put(`/notes/${props.noteid}`,updatedNote,{withCredentials:true})
      if(response.data.message == "Note Updated!") alert(`Updated`)
    } catch (error) {
      console.log(`Error ${error}`)
    }
  }
  return (
    <main className="max-w-full">
      <div className="flex items-center gap-3 mb-4">
        <button className="flex gap-1 px-3 py-2 rounded drop-shadow bg-button" onClick={() => setIsEditable(!isEditable)}>
          {!isEditable ? "Lock" : "Unlock"}
          {!isEditable ? (
            <BsLockFill title="Lock" className="w-6 h-6 text-gray-500" />
          ) : (
            <BsUnlockFill title="Unlock" className="w-6 h-6" />
          )}
        </button>
        {
          isEditable && <button onClick={save} title="Save" className="flex gap-1 px-3 py-2 rounded drop-shadow bg-button">
            Save
            <MdSave className="w-6 h-6" />
          </button>
        }

        <button onClick={() => {
          changeVisibilty(props.noteid)
          setIsPrivate((prev) => !prev)
        }} className="flex gap-1 px-2 py-1 rounded drop-shadow bg-button">
          {isPrivate ? "Private" : "Public"}
          {isPrivate ? <MdVisibilityOff title="Private" className="w-6 h-6" /> : <MdVisibility title="Public " className="w-6 h-6" />}
        </button>
      </div>
      {!isEditable ? (
        <h1
          className={`w-full mb-2 text-2xl font-bold outline-none sm:text-3xl md:text-4xl bg-inherit ${!title && "text-gray-400"
            }`}
        >
          {!title ? "Your Title" : title}
        </h1>
      ) : (
        <>
          <MenuBar editor={editor} />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-2 text-2xl font-bold outline-none sm:text-3xl md:text-4xl bg-inherit"
            placeholder="What's The Title"
          />
          <Tags
            tags={tags}
            setTags={setTags}
            setSuggestions={setSuggestions}
            suggestions={suggestions} />
        </>
      )}
      <hr />
      <TipTap editor={editor} />
    </main>
  );
};
export default Editor