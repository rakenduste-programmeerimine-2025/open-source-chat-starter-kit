import React from "react"
import { DM_Serif_Text, Google_Sans_Code } from "next/font/google"
import Link from "next/link"

const DMserifText = DM_Serif_Text({
  weight: "400",
})

const googleSansCode = Google_Sans_Code({
  weight: "400",
})

function LandingPage() {
  return (
    <div className="flex h-screen flex-col">
        <header className={`flex w-screen flex-row justify-end pr-[2%] pt-[1%] ${googleSansCode.className}`}>
            <Link href={''}>GitHub</Link>
        </header>
      <div className="flex-grow">
        <div className="flex h-1/2 w-screen mt-[2%] flex-row justify-between">
          <div className="flex w-[40%] bg-gradient-to-b from-violet-600 to-blue-900 rounded-xl border-white border-4 animate-fadeInTwo overflow-hidden">
            <div className={`text-white text-[280%] ${DMserifText.className}`}>
              <div
                className="opacity-0 animate-fadeInOne"
                style={{ animationDelay: "200ms" }}
              >
                You create,
              </div>
              <div
                className="opacity-0 animate-fadeInOne
                "
                style={{ animationDelay: "400ms" }}
              >
                You invite,
              </div>
              <div
                className="opacity-0 animate-fadeInOne"
                style={{ animationDelay: "600ms" }}
              >
                You talk
              </div>
              <div
                className="opacity-0 animate-fadeInOne"
                style={{ animationDelay: "800ms" }}
              >
                Simple as that
              </div>
              <div
                className="underline opacity-0 animate-fadeInOne"
                style={{ animationDelay: "1000ms" }}
              >
                No hidden agenda, no corporate BS
              </div>
            </div>
          </div>
          <div
            className="opacity-0 flex w-[40%] bg-pink-700 border-4 border-white rounded-xl animate-fadeInTwo"
            style={{ animationDelay: "200ms" }}
          >
            <div>image or something in here</div>
          </div>
        </div>
        <div className="justify-between flex flex-row w-screen h-[10%] mt-[3%]">
          <Link
            href={"/auth/sign-up"}
            className="opacity-0 flex flex-col bg-white w-[10%] ml-[33%] rounded-xl animate-fadeInThree items-center justify-center"
            style={{ animationDelay: "400ms" }}
          >
            <div
              className={`text-black text-center overflow-hidden ${googleSansCode.className} hover:underline`}
            >
              Create an account and get started today
            </div>
          </Link>
          <Link
            href={"/auth/login"}
            className="flex flex-col items-center justify-center bg-gray-800 w-[10%] mr-[33%] overflow-hidden rounded-xl opacity-0 animate-fadeInThree"
            style={{ animationDelay: "600ms" }}
          >
            <div className={`${googleSansCode.className} hover:underline text-center`}>
              <div>Already have an account?</div>
              <div>Log in</div>
            </div>
          </Link>
        </div>
      </div>
      <footer className="text-white p-6">
        <div className="flex flex-col items-center justify-center">
          <div>Created by @marmarsell, @RenatMagsumov, @ReDerEE</div>
          <div>Tallinn 2025</div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
