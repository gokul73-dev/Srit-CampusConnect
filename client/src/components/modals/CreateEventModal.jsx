import React, { useState } from "react"
import API from "../../services/api"
import Button from "../ui/Button"

export default function CreateEventModal({
  open,
  onClose,
  onCreated
}) {

  const [form, setForm] = useState({
    title: "",
    clubName: "",
    startsAt: "",
    location: "",
    maxParticipants: "",
    description: ""
  })

  const [loading, setLoading] = useState(false)

  if (!open) return null


  function handleChange(e) {

    const { name, value } = e.target

    setForm(prev => ({
      ...prev,
      [name]: value
    }))

  }


  async function handleSubmit(e) {

    e.preventDefault()

    if (!form.title.trim())
      return alert("Event title is required")

    if (!form.startsAt)
      return alert("Event date & time is required")


    try {

      setLoading(true)

      const payload = {

        title: form.title.trim(),

        clubName: form.clubName.trim(),

        location: form.location.trim(),

        description: form.description.trim(),

        maxParticipants:
          form.maxParticipants
            ? Number(form.maxParticipants)
            : 0,

        // convert to ISO for backend
        startsAt:
          new Date(form.startsAt).toISOString()

      }


      const res =
        await API.post("/events", payload)


      if (res.data)
        onCreated(res.data)


      onClose()


      // reset form
      setForm({
        title: "",
        clubName: "",
        startsAt: "",
        location: "",
        maxParticipants: "",
        description: ""
      })


    }
    catch (err) {

      console.error(err)

      alert(
        err.response?.data?.message ||
        "Failed to create event"
      )

    }
    finally {

      setLoading(false)

    }

  }


  return (

    <div className="
      fixed inset-0
      flex items-center justify-center
      bg-black/40 z-50
    ">

      <div className="
        bg-white
        w-full max-w-sm
        rounded-lg
        shadow-lg
        p-4
        animate-fadeIn
      ">

        {/* HEADER */}
        <div className="
          flex justify-between items-center
          mb-3
        ">

          <h2 className="text-lg font-semibold">
            Create Event
          </h2>

          <button
            onClick={onClose}
            className="
              text-gray-500
              hover:text-black
              text-lg
            "
          >
            ✕
          </button>

        </div>


        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-3"
        >

          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />


          <Input
            label="Club Name"
            name="clubName"
            value={form.clubName}
            onChange={handleChange}
          />


          <Input
            label="Date & Time"
            type="datetime-local"
            name="startsAt"
            value={form.startsAt}
            onChange={handleChange}
            required
          />


          <Input
            label="Location"
            name="location"
            value={form.location}
            onChange={handleChange}
          />


          <Input
            label="Max Participants"
            type="number"
            name="maxParticipants"
            value={form.maxParticipants}
            onChange={handleChange}
            min="0"
          />


          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            className="
              w-full border rounded
              px-2 py-1 text-sm
              focus:outline-none
              focus:ring-2
              focus:ring-indigo-500
            "
          />


          {/* BUTTONS */}
          <div className="
            flex justify-end gap-2
            pt-2
          ">

            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
            >
              Cancel
            </Button>


            <Button
              type="submit"
              disabled={loading}
              className="
                bg-indigo-600
                hover:bg-indigo-700
                text-white
              "
            >
              {loading
                ? "Creating..."
                : "Create"}
            </Button>

          </div>

        </form>

      </div>

    </div>

  )

}


/* INPUT COMPONENT */

function Input({ label, ...props }) {

  return (

    <div>

      <label className="
        block text-sm font-medium mb-1
      ">
        {label}
      </label>

      <input
        {...props}
        className="
          w-full border rounded
          px-2 py-1 text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-indigo-500
        "
      />

    </div>

  )

}
