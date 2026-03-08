import React, { useEffect, useState } from "react"
import API from "../services/api"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import { Calendar, Plus } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"
import CreateEventModal from "../components/modals/CreateEventModal"

export default function Events() {

  const { profile } = useAuth()

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)

  const role =
    profile?.role?.toLowerCase() || ""

  const isStudent =
    role === "student"

  const canCreate =
    ["faculty", "clubhead", "admin"]
      .includes(role)



  useEffect(() => {
    loadEvents()
  }, [])



  async function loadEvents() {

    try {

      const res =
        await API.get("/events")

      let fetchedEvents =
        Array.isArray(res.data)
          ? res.data
          : res.data.events || []


      const now = new Date()


      // Students see only upcoming events
      if (isStudent) {

        fetchedEvents =
          fetchedEvents.filter(event =>
            event.startsAt &&
            new Date(event.startsAt) >= now
          )

      }


      // Sort events by date ascending
      fetchedEvents.sort(
        (a, b) =>
          new Date(a.startsAt) -
          new Date(b.startsAt)
      )


      setEvents(fetchedEvents)

    }
    catch (err) {

      console.error(
        "Error loading events:",
        err
      )

    }
    finally {

      setLoading(false)

    }

  }



  async function handleRegister(eventId) {

    try {

      const res =
        await API.post(
          `/events/${eventId}/register`
        )

      alert("Registered successfully!")


      const updated =
        events.map(event =>
          event._id === eventId
            ? res.data.event
            : event
        )

      setEvents(updated)

    }
    catch (err) {

      alert(
        err.response?.data?.message ||
        "Failed to register"
      )

    }

  }



  function formatEventDate(date) {

    if (!date) return "TBA"

    const d = new Date(date)

    const formattedDate =
      d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
      })

    const formattedTime =
      d.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit"
      })

    return `${formattedDate} at ${formattedTime}`

  }



  if (loading)
    return (
      <div className="
        min-h-screen flex
        items-center justify-center
        text-gray-500
      ">
        Loading Events...
      </div>
    )



  return (

    <div className="
      min-h-screen
      bg-gradient-to-b
      from-[#f9f9fb]
      via-[#f2f2f7]
      to-[#e7e9ff]
      p-8
    ">

      {/* HEADER */}
      <div className="
        flex items-center
        justify-between mb-6
      ">

        <h1 className="
          text-3xl font-bold
          flex items-center gap-2
        ">

          <Calendar className="
            w-6 h-6 text-indigo-500
          "/>

          Events

        </h1>


        {canCreate && (

          <Button
            onClick={() =>
              setOpenModal(true)
            }
            className="
              bg-gradient-to-r
              from-indigo-500
              to-blue-500
              text-white px-4 py-2
              rounded-md hover:opacity-90
              flex items-center gap-2
            "
          >

            <Plus className="w-5 h-5"/>

            Create Event

          </Button>

        )}

      </div>



      {/* EVENT LIST */}
      {events.length === 0 ? (

        <p className="text-gray-500">
          No upcoming events available.
        </p>

      ) : (

        <div className="grid gap-4">

          {events.map(event => {

            const isFull =
              event.maxParticipants > 0 &&
              event.participants?.length >=
              event.maxParticipants


            return (

              <Card
                key={event._id}
                className="
                  p-5 hover:shadow-md
                  transition
                "
              >

                {/* TITLE + DATE */}
                <div className="
                  flex justify-between
                  items-center mb-1
                ">

                  <h2 className="
                    text-lg font-semibold
                  ">
                    {event.title}
                  </h2>


                  <span className="
                    text-xs text-gray-500
                    font-medium
                  ">
                    {formatEventDate(
                      event.startsAt
                    )}
                  </span>

                </div>


                {/* LOCATION */}
                <p className="
                  text-gray-700 mb-1
                ">
                  {event.location ||
                    "Location: TBA"}
                </p>


                {/* DESCRIPTION */}
                <p className="
                  text-sm text-gray-600
                ">
                  {event.description}
                </p>


                {/* PARTICIPANTS */}
                <div className="
                  mt-4 border-t pt-3
                ">

                  <p className="
                    text-sm font-semibold
                    text-gray-700 mb-1
                  ">

                    Participants
                    (
                    {event.participants?.length || 0}
                    /
                    {event.maxParticipants || "∞"}
                    )

                  </p>


                  <ul className="
                    text-sm text-gray-600
                    space-y-1 max-h-32
                    overflow-y-auto
                  ">

                    {event.participants?.map(p => (

                      <li key={p._id}>
                        👤 {p.name}
                      </li>

                    ))}

                  </ul>

                </div>


                {/* REGISTER BUTTON */}
                {isStudent && (

                  <div className="mt-3">

                    <Button
                      disabled={isFull}
                      onClick={() =>
                        handleRegister(
                          event._id
                        )
                      }
                      className={`
                        px-3 py-1 rounded
                        ${
                          isFull
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 text-white hover:opacity-90"
                        }
                      `}
                    >

                      {isFull
                        ? "Full"
                        : "Register"}

                    </Button>

                  </div>

                )}

              </Card>

            )

          })}

        </div>

      )}



      {/* CREATE EVENT MODAL */}
      {canCreate && (

        <CreateEventModal
          open={openModal}
          onClose={() =>
            setOpenModal(false)
          }
          onCreated={newEvent =>
            setEvents([
              newEvent,
              ...events
            ])
          }
        />

      )}

    </div>

  )

}
