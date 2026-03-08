import React, { useState, useEffect, useRef } from 'react';
import Button from '../ui/Button';
import API from '../../services/api';

export default function CreateClubModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'Technical',
    faculty: '',
    clubHead: '',
  });

  const [facultyList, setFacultyList] = useState([]);
  const [students, setStudents] = useState([]);

  const [facultyOpen, setFacultyOpen] = useState(false);
  const [studentOpen, setStudentOpen] = useState(false);

  const [facultySearch, setFacultySearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  const [loading, setLoading] = useState(false);

  const facultyRef = useRef();
  const studentRef = useRef();

  const categories = [
    'Technical',
    'Cultural',
    'Sports',
    'Social',
    'Academic',
    'Other',
  ];

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await API.get('/users');
        const allUsers = res.data || [];

        setFacultyList(allUsers.filter(u => u.role === 'faculty'));
        setStudents(allUsers.filter(u => u.role === 'student'));
      } catch (err) {
        alert('Failed to load users');
      }
    }

    loadUsers();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (facultyRef.current && !facultyRef.current.contains(e.target)) {
        setFacultyOpen(false);
      }
      if (studentRef.current && !studentRef.current.contains(e.target)) {
        setStudentOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.description || !form.faculty || !form.clubHead) {
      alert('Please fill all required fields');
      return;
    }

    if (form.faculty === form.clubHead) {
      alert('Faculty and Club Head cannot be the same person');
      return;
    }

    try {
      setLoading(true);
      await API.post('/clubs', form);
      alert('Club created successfully');
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = facultyList.filter(f =>
    f.name.toLowerCase().includes(facultySearch.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-[420px] rounded-xl shadow-2xl p-6 space-y-4">

        <h2 className="text-lg font-semibold">Create New Club</h2>

        {/* Club Name */}
        
        <input
          className="w-full border rounded-md px-3 py-2 text-sm"
          placeholder="Club Name *"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />

        {/* Description */}
        <textarea
          className="w-full border rounded-md px-3 py-2 text-sm"
          placeholder="Description *"
          rows="3"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />

        {/* Category */}
        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          {categories.map(cat => (
            <option key={cat}>{cat}</option>
          ))}
        </select>

        {/* Faculty Searchable Dropdown */}
        <div className="relative" ref={facultyRef}>
          <div
            onClick={() => setFacultyOpen(!facultyOpen)}
            className="w-full border rounded-md px-3 py-2 text-sm cursor-pointer bg-white"
          >
            {form.faculty
              ? facultyList.find(f => f._id === form.faculty)?.name
              : "Select Faculty Incharge *"}
          </div>

          {facultyOpen && (
            <div className="absolute z-10 bg-white border rounded-md w-full mt-1 max-h-40 overflow-y-auto shadow">
              <input
                className="w-full px-2 py-1 text-sm border-b"
                placeholder="Search..."
                value={facultySearch}
                onChange={e => setFacultySearch(e.target.value)}
              />
              {filteredFaculty.map(f => (
                <div
                  key={f._id}
                  className={`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                    f._id === form.clubHead ? "opacity-40 pointer-events-none" : ""
                  }`}
                  onClick={() => {
                    setForm({ ...form, faculty: f._id });
                    setFacultyOpen(false);
                  }}
                >
                  {f.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Student Searchable Dropdown */}
        <div className="relative" ref={studentRef}>
          <div
            onClick={() => setStudentOpen(!studentOpen)}
            className="w-full border rounded-md px-3 py-2 text-sm cursor-pointer bg-white"
          >
            {form.clubHead
              ? students.find(s => s._id === form.clubHead)?.name
              : "Select Club Head (Student) *"}
          </div>

          {studentOpen && (
            <div className="absolute z-10 bg-white border rounded-md w-full mt-1 max-h-40 overflow-y-auto shadow">
              <input
                className="w-full px-2 py-1 text-sm border-b"
                placeholder="Search..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
              />
              {filteredStudents.map(s => (
                <div
                  key={s._id}
                  className={`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer ${
                    s._id === form.faculty ? "opacity-40 pointer-events-none" : ""
                  }`}
                  onClick={() => {
                    setForm({ ...form, clubHead: s._id });
                    setStudentOpen(false);
                  }}
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white"
        >
          {loading ? "Creating..." : "Create Club"}
        </Button>

      </div>
    </div>
  );
}
