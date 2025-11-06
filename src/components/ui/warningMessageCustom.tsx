  const WarningMessage = () => {
    return (
      <div className="bg-[#523F1A] text-white p-2 max-w-[706px] text-center rounded-full absolute top-4 px-6 " role="alert">
        <p className="font-regular text-lg">
          You are using MARK Lite, <u  className='cursor-pointer' onClick={()=>open('https://studio.dhiway.com/')}>Upgrade to MARK Studio</u> for Template Designer
        </p>
      </div>
    )
  }
  export default WarningMessage;