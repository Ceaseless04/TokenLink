import React, { useState } from "react";
import { supabase } from "../lib/supabase";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [role, setRole] = useState("attendee");
  const [name, setName] = useState("");

  const handleSignUp = async () => {
    setMessage("");

    // Step 1: Create Auth Account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    const authUser = data.user;

    if (!authUser) {
      setMessage("Signup succeeded, but no user returned.");
      return;
    }

    // Step 2: Create Profile Row
    if (role === "attendee") {
      const { error: profileError } = await supabase.from("users").insert({
        account_id: authUser.id,
        display_name: name,
      });

      if (profileError) {
        setMessage(`Profile Error: ${profileError.message}`);
        return;
      }

      setMessage("Attendee account created!");
    }

    if (role === "organizer") {
      const { error: orgError } = await supabase.from("organizers").insert({
        account_id: authUser.id,
        name: name,
        description: "",
      });

      if (orgError) {
        setMessage(`Organizer Error: ${orgError.message}`);
        return;
      }

      setMessage("Organizer account created!");
    }
  };

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setMessage(`Error: ${error.message}`);
    else setMessage(`Logged in!`);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Auth Test</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", marginBottom: 10 }}
      />
      <input
        type="text"
        placeholder="Display Name / Organizer Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="attendee">Attendee</option>
        <option value="organizer">Organizer</option>
      </select>

      <button onClick={handleSignUp} style={{ marginRight: 10 }}>
        Sign Up
      </button>
      <button onClick={handleLogin}>Login</button>
      <p>{message}</p>
    </div>
  );
};

export default Auth;
