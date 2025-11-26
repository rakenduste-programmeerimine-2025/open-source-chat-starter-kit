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
      <div className="flex-grow">
        <div className="flex bg-red-900 h-1/2 w-screen mt-[5%] flex-row justify-between">
          <div className="flex w-[40%] bg-gradient-to-b from-violet-400 to-blue-900 rounded-xl border-white border-4">
            <div className={`text-white text-[280%] ${DMserifText.className}`}>
              <div>You create,</div>
              <div>You invite,</div>
              <div>You talk</div>
              <div>Simple as that</div>
              <div className="underline">No hidden agenda, no corporate BS</div>
            </div>
          </div>
          <div className="flex w-[40%] bg-pink-700 border-4 border-white rounded-xl">
            <div>image or something in here</div>
          </div>
        </div>
        <div className="justify-between flex flex-row w-screen h-[10%] mt-[3%] bg-red-500">
          <Link
            href={"/auth/sign-up"}
            className="flex flex-col bg-gradient-to-t from-blue-800 to-gray-900 w-[10%] ml-[30%] border-4 border-black rounded-xl"
          >
            <div
              className={`items-center justify-center overflow-hidden ${googleSansCode.className} hover:underline`}
            >
              Create an account and get started today
            </div>
          </Link>
          <Link
            href={"/auth/login"}
            className="flex flex-col bg-gradient-to-t from-green-800 to-gray-900 w-[10%] mr-[30%] border-4 border-black overflow-hidden rounded-xl"
          >
            <div className={`${googleSansCode.className} hover:underline`}>
              <div>Already have an account?</div>
              <div>Log in</div>
            </div>
          </Link>
        </div>
      </div>
      <footer className="bg-gray-800 text-white p-6">
        <div className="flex flex-col items-center justify-center">
          <div>Created by @marmarsell, @RenatMagsumov, @ReDerEE</div>
          <div>Tallinn 2025</div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
