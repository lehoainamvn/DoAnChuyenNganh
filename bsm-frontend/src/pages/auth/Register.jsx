import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../../api/auth.api";
import toast from "react-hot-toast";

export default function Register() {

  const navigate = useNavigate();

  const [form,setForm] = useState({
    name:"",
    phone:"",
    email:"",
    password:"",
    confirmPassword:"",
    role:"OWNER"
  });

  const [loading,setLoading] = useState(false);

  /* ================= CAPTCHA ================= */

  const [num1,setNum1] = useState(0);
  const [num2,setNum2] = useState(0);
  const [captchaAnswer,setCaptchaAnswer] = useState("");

  function generateCaptcha(){
    const a = Math.floor(Math.random()*10)+1;
    const b = Math.floor(Math.random()*10)+1;

    setNum1(a);
    setNum2(b);
    setCaptchaAnswer("");
  }

  useEffect(()=>{
    generateCaptcha();
  },[]);

  /* ================= FORM ================= */

  function handleChange(e){
    const {name,value} = e.target;

    setForm(prev=>({
      ...prev,
      [name]:value
    }));
  }

  /* ================= VALIDATE ================= */

  function validate(){

    if(!form.name.trim()){
      toast.error("Vui lòng nhập họ và tên");
      return false;
    }

    if(form.name.trim().length < 3){
      toast.error("Tên phải tối thiểu 3 ký tự");
      return false;
    }

    if(!form.phone){
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }

    if(!/^[0-9]+$/.test(form.phone)){
      toast.error("Số điện thoại chỉ được chứa số");
      return false;
    }

    if(form.phone.length < 10 || form.phone.length > 11){
      toast.error("Số điện thoại phải từ 10 - 11 số");
      return false;
    }

    // ===== EMAIL VALID =====
    if(!form.email){
      toast.error("Vui lòng nhập email");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(form.email)){
      toast.error("Email không hợp lệ");
      return false;
    }

    if(!form.password){
      toast.error("Vui lòng nhập mật khẩu");
      return false;
    }

    if(form.password.length < 6){
      toast.error("Mật khẩu phải tối thiểu 6 ký tự");
      return false;
    }

    if(form.password !== form.confirmPassword){
      toast.error("Mật khẩu nhập lại không khớp");
      return false;
    }

    if(Number(captchaAnswer) !== num1 + num2){
      toast.error("Captcha không đúng");
      generateCaptcha();
      return false;
    }

    return true;
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(e){

    e.preventDefault();

    if(!validate()) return;

    try{

      setLoading(true);

      await toast.promise(

        registerApi({
          name:form.name,
          phone:form.phone,
          email:form.email, // ✅ dùng email thật
          password:form.password,
          role:form.role
        }),

        {
          loading:"Đang đăng ký...",
          success:"Đăng ký thành công",
          error:"Đăng ký thất bại"
        }

      );

      setTimeout(()=>{
        navigate("/");
      },800);

    }catch(err){
      toast.error(err?.message || "Đăng ký thất bại");
    }finally{
      setLoading(false);
    }

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-indigo-50 flex items-center justify-center px-4">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid md:grid-cols-2">

        {/* LEFT */}
        <div className="hidden md:flex flex-col justify-center bg-white border-r p-10 space-y-6">
          <h1 className="text-3xl font-extrabold text-slate-800">
            BSM Management
          </h1>

          <p className="text-slate-500">
            Hệ thống quản lý nhà trọ chuyên nghiệp
          </p>
        </div>

        {/* RIGHT */}
        <div className="p-10 space-y-6">

          <h2 className="text-2xl font-bold text-slate-800">
            Tạo tài khoản
          </h2>

          {/* ROLE */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={()=>setForm({...form,role:"OWNER"})}
              className={`p-4 rounded-2xl border ${
                form.role==="OWNER"
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-200"
              }`}
            >
              Chủ trọ
            </button>

            <button
              type="button"
              onClick={()=>setForm({...form,role:"TENANT"})}
              className={`p-4 rounded-2xl border ${
                form.role==="TENANT"
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-200"
              }`}
            >
              Người thuê
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="name"
              placeholder="Họ và tên"
              value={form.name}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl"
            />

            <input
              type="text"
              name="phone"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl"
            />

            {/* ===== EMAIL INPUT MỚI ===== */}
            <input
              type="email"
              name="email"
              placeholder="Email (dùng để nhận OTP)"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl"
            />

            <input
              type="password"
              name="password"
              placeholder="Mật khẩu"
              value={form.password}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl"
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border px-4 py-3 rounded-xl"
            />

            {/* CAPTCHA */}
            <div className="bg-slate-50 p-4 rounded-xl border">
              <div className="flex items-center gap-3">
                <div className="font-bold text-indigo-600">
                  {num1} + {num2} = ?
                </div>

                <input
                  type="number"
                  value={captchaAnswer}
                  onChange={(e)=>setCaptchaAnswer(e.target.value)}
                  className="w-24 border px-3 py-2 rounded-lg"
                />
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

          </form>

          <p className="text-sm text-center">
            Đã có tài khoản?{" "}
            <Link to="/" className="text-indigo-600">
              Đăng nhập
            </Link>
          </p>

        </div>

      </div>

    </div>

  );
}