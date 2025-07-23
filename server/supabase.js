import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    "https://kbpqoagcvbycqzzilkfa.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImticHBvcWdjdmJ5Y3F6emlrbGZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjQ3MTIsImV4cCI6MjA2ODg0MDcxMn0.QFpV9IDnxSxaYQ--hjIWWxvUNjLDeZwXgmuevaOpSwg"
);

export default supabase;