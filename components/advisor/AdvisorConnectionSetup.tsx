"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertTriangle,
  Check,
  Copy,
  KeyRound,
  RefreshCw,
  X,
} from "lucide-react";

import {
  supabase,
} from "@/lib/supabase";


type AdvisorConnection = {
  id: string;

  account_number:
    | string
    | null;

  platform:
    | string
    | null;

  broker:
    | string
    | null;

  server:
    | string
    | null;

  account_currency:
    | string
    | null;

  last_balance:
    | number
    | string
    | null;

  last_equity:
    | number
    | string
    | null;

  last_deal_time_msc:
    | number
    | string
    | null;

  last_sync_at:
    | string
    | null;

  last_connected_at:
    | string
    | null;

  status: string;

  created_at: string;
};


export default function AdvisorConnectionSetup() {

  const [
    accountNumber,
    setAccountNumber,
  ] =
    useState("");


  const [
    advisorKey,
    setAdvisorKey,
  ] =
    useState("");


  const [
    connection,
    setConnection,
  ] =
    useState<
      AdvisorConnection |
      null
    >(
      null
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    creating,
    setCreating,
  ] =
    useState(
      false
    );


  const [
    switching,
    setSwitching,
  ] =
    useState(
      false
    );


  const [
    changingAccount,
    setChangingAccount,
  ] =
    useState(
      false
    );


  const [
    newAccountNumber,
    setNewAccountNumber,
  ] =
    useState("");


  const [
    pendingAccountNumber,
    setPendingAccountNumber,
  ] =
    useState("");


  const [
    confirmSwitchOpen,
    setConfirmSwitchOpen,
  ] =
    useState(
      false
    );


  const [
    copied,
    setCopied,
  ] =
    useState(
      false
    );


  const [
    error,
    setError,
  ] =
    useState("");


  // ========================================
  // LOAD CURRENT CONNECTION
  // ========================================

  useEffect(
    () => {
      loadCurrentConnection();
    },
    []
  );


  async function getSession() {

    const {
      data: {
        session,
      },
    } =
      await supabase
        .auth
        .getSession();


    return session;
  }


  async function loadCurrentConnection() {

    try {

      setLoading(
        true
      );


      setError(
        ""
      );


      const session =
        await getSession();


      if (!session) {

        setError(
          "Please log in first."
        );

        return;
      }


      const response =
        await fetch(
          "/api/advisor/connections/current",
          {
            headers: {
              Authorization:
                `Bearer ${session.access_token}`,
            },
          }
        );


      const data =
        await response.json();


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.error ??
          "Could not load Advisor connection."
        );
      }


      if (
        data.connected &&
        data.connection
      ) {

        setConnection(
          data.connection
        );


        setAccountNumber(
          String(
            data.connection
              .account_number ??
            ""
          )
        );


        setAdvisorKey(
          data.advisor_key ??
          ""
        );
      }

      else {

        setConnection(
          null
        );


        setAdvisorKey(
          ""
        );
      }

    }

    catch (
      loadError
    ) {

      setError(
        loadError
          instanceof Error
          ? loadError.message
          : "Could not load Advisor connection."
      );

    }

    finally {

      setLoading(
        false
      );
    }
  }


  // ========================================
  // CREATE FIRST CONNECTION
  // ========================================

  async function createConnection() {

    const normalizedAccount =
      accountNumber.trim();


    if (!normalizedAccount) {

      setError(
        "Enter your MetaTrader account number."
      );

      return;
    }


    if (
      !/^\d+$/.test(
        normalizedAccount
      )
    ) {

      setError(
        "MetaTrader account number must contain only numbers."
      );

      return;
    }


    try {

      setCreating(
        true
      );


      setError(
        ""
      );


      const session =
        await getSession();


      if (!session) {

        setError(
          "Please log in first."
        );

        return;
      }


      const response =
        await fetch(
          "/api/advisor/connections/create",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify({
                account_number:
                  normalizedAccount,
              }),
          }
        );


      const data =
        await response.json();


      if (
        response.status ===
          409 &&
        data.account_change
      ) {

        setError(
          `Advisor is already connected to account ${data.current_account}.`
        );

        return;
      }


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.error ??
          "Could not create Advisor connection."
        );
      }


      setAdvisorKey(
        data.advisor_key
      );


      setConnection(
        data.connection
      );

    }

    catch (
      createError
    ) {

      setError(
        createError
          instanceof Error
          ? createError.message
          : "Could not create Advisor connection."
      );

    }

    finally {

      setCreating(
        false
      );
    }
  }


  // ========================================
  // PREPARE ACCOUNT CHANGE
  // ========================================

  function prepareAccountSwitch() {

    const normalized =
      newAccountNumber.trim();


    setError(
      ""
    );


    if (!normalized) {

      setError(
        "Enter the new MetaTrader account number."
      );

      return;
    }


    if (
      !/^\d+$/.test(
        normalized
      )
    ) {

      setError(
        "MetaTrader account number must contain only numbers."
      );

      return;
    }


    if (
      normalized ===
      String(
        connection
          ?.account_number ??
        ""
      )
    ) {

      setError(
        "This MetaTrader account is already connected."
      );

      return;
    }


    setPendingAccountNumber(
      normalized
    );


    setConfirmSwitchOpen(
      true
    );
  }


  // ========================================
  // SWITCH ACCOUNT
  // ========================================

  async function switchAccount() {

    if (
      !pendingAccountNumber
    ) {
      return;
    }


    try {

      setSwitching(
        true
      );


      setError(
        ""
      );


      const session =
        await getSession();


      if (!session) {

        setError(
          "Please log in first."
        );

        return;
      }


      const response =
        await fetch(
          "/api/advisor/connections/switch",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${session.access_token}`,
            },

            body:
              JSON.stringify({
                account_number:
                  pendingAccountNumber,

                confirm:
                  true,
              }),
          }
        );


      const data =
        await response.json();


      if (
        !response.ok ||
        !data.success
      ) {

        throw new Error(
          data.error ??
          "Could not switch MetaTrader account."
        );
      }


      // ====================================
      // NEW CONNECTION
      // ====================================

      setConnection(
        data.connection
      );


      setAdvisorKey(
        data.advisor_key
      );


      setAccountNumber(
        String(
          data.connection
            .account_number
        )
      );


      setNewAccountNumber(
        ""
      );


      setPendingAccountNumber(
        ""
      );


      setChangingAccount(
        false
      );


      setConfirmSwitchOpen(
        false
      );


      setCopied(
        false
      );

    }

    catch (
      switchError
    ) {

      setError(
        switchError
          instanceof Error
          ? switchError.message
          : "Could not switch MetaTrader account."
      );

    }

    finally {

      setSwitching(
        false
      );
    }
  }


  // ========================================
  // COPY KEY
  // ========================================

  async function copyKey() {

    if (!advisorKey) {
      return;
    }


    await navigator
      .clipboard
      .writeText(
        advisorKey
      );


    setCopied(
      true
    );


    setTimeout(
      () =>
        setCopied(
          false
        ),
      2000
    );
  }


  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (
      <div className="
        rounded-3xl
        border
        border-cyan-400/15
        bg-cyan-400/[0.03]
        p-8
      ">

        <div className="
          h-48
          animate-pulse
          rounded-2xl
          bg-white/[0.03]
        " />

      </div>
    );
  }


  // ========================================
  // UI
  // ========================================

  return (
    <>

      <div className="
        rounded-3xl
        border
        border-cyan-400/15
        bg-cyan-400/[0.03]
        p-6
        sm:p-8
      ">

        <div className="
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          bg-cyan-400/[0.08]
          text-cyan-300
        ">

          <KeyRound
            size={22}
          />

        </div>


        <h2 className="
          mt-6
          text-2xl
          font-bold
          text-white
        ">
          Connect Advisor Agent
        </h2>


        {/* ====================================
            NO CONNECTION
        ==================================== */}

        {!connection && (

          <>

            <p className="
              mt-3
              max-w-xl
              leading-7
              text-gray-400
            ">
              Enter the MetaTrader account
              you want ElAlgo Advisor to
              analyze.
            </p>


            <div className="
              mt-7
              max-w-md
            ">

              <label className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.18em]
                text-gray-500
              ">
                MetaTrader Account Number
              </label>


              <input
                type="text"
                inputMode="numeric"
                value={
                  accountNumber
                }
                onChange={(
                  event
                ) =>
                  setAccountNumber(
                    event.target
                      .value
                  )
                }
                placeholder="Example: 91140491"
                className="
                  mt-3
                  w-full
                  rounded-xl
                  border
                  border-white/10
                  bg-[#030611]
                  px-4
                  py-3
                  text-white
                  outline-none
                  transition
                  placeholder:text-gray-600
                  focus:border-cyan-400/40
                "
              />


              <button
                type="button"
                onClick={
                  createConnection
                }
                disabled={
                  creating
                }
                className="
                  mt-4
                  rounded-xl
                  bg-cyan-400
                  px-6
                  py-3
                  font-bold
                  text-[#020611]
                  transition
                  hover:bg-cyan-300
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {
                  creating
                    ? "Connecting..."
                    : "Connect MetaTrader Account"
                }

              </button>

            </div>

          </>

        )}


        {/* ====================================
            CONNECTION EXISTS
        ==================================== */}

        {connection && (

          <div className="
            mt-7
          ">

            <div className="
              flex
              flex-wrap
              items-center
              gap-3
            ">

              <span className="
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-emerald-400/20
                bg-emerald-400/10
                px-3
                py-1.5
                text-xs
                font-semibold
                text-emerald-300
              ">

                <span className="
                  h-2
                  w-2
                  rounded-full
                  bg-emerald-400
                " />

                Connected

              </span>


              {connection.platform && (

                <span className="
                  text-xs
                  uppercase
                  text-gray-500
                ">

                  {
                    connection
                      .platform
                  }

                </span>

              )}

            </div>


            {/* ACCOUNT INFO */}

            <div className="
              mt-6
              grid
              gap-3
              sm:grid-cols-2
              lg:grid-cols-3
            ">

              <InfoItem
                label="MetaTrader Account"
                value={
                  String(
                    connection
                      .account_number
                  )
                }
              />


              <InfoItem
                label="Broker"
                value={
                  connection
                    .broker ??
                  "Waiting for Agent"
                }
              />


              <InfoItem
                label="Server"
                value={
                  connection
                    .server ??
                  "Waiting for Agent"
                }
              />

            </div>


            {/* KEY */}

            <div className="
              mt-7
            ">

              <p className="
                text-xs
                font-semibold
                uppercase
                tracking-[0.2em]
                text-cyan-400
              ">
                Your Advisor Key
              </p>


              <div className="
                mt-3
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-white/10
                bg-[#030611]
                p-4
              ">

                <code className="
                  min-w-0
                  flex-1
                  break-all
                  text-sm
                  text-gray-300
                ">

                  {
                    advisorKey
                  }

                </code>


                <button
                  type="button"
                  onClick={
                    copyKey
                  }
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/10
                    text-gray-400
                    transition
                    hover:bg-white/[0.05]
                    hover:text-white
                  "
                >

                  {
                    copied
                      ? (
                        <Check
                          size={17}
                          className="
                            text-emerald-400
                          "
                        />
                      )
                      : (
                        <Copy
                          size={17}
                        />
                      )
                  }

                </button>

              </div>


              <p className="
                mt-3
                text-xs
                leading-6
                text-gray-500
              ">
                This key is permanently
                associated with this ElAlgo
                user and MetaTrader account.
              </p>

            </div>


            {/* ==================================
                CHANGE ACCOUNT
            ================================== */}

            <div className="
              mt-8
              border-t
              border-white/[0.06]
              pt-6
            ">

              {!changingAccount && (

                <button
                  type="button"
                  onClick={() => {

                    setChangingAccount(
                      true
                    );

                    setError(
                      ""
                    );
                  }}
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-semibold
                    text-gray-400
                    transition
                    hover:text-white
                  "
                >

                  <RefreshCw
                    size={15}
                  />

                  Change MetaTrader Account

                </button>

              )}


              {changingAccount && (

                <div className="
                  max-w-md
                ">

                  <p className="
                    text-sm
                    font-semibold
                    text-white
                  ">
                    Connect another MetaTrader account
                  </p>


                  <p className="
                    mt-2
                    text-xs
                    leading-6
                    text-gray-500
                  ">
                    Enter the new account number.
                    You will be asked to confirm
                    before any existing data is
                    removed.
                  </p>


                  <input
                    type="text"
                    inputMode="numeric"
                    value={
                      newAccountNumber
                    }
                    onChange={(
                      event
                    ) =>
                      setNewAccountNumber(
                        event.target
                          .value
                      )
                    }
                    placeholder="New MetaTrader account"
                    className="
                      mt-4
                      w-full
                      rounded-xl
                      border
                      border-white/10
                      bg-[#030611]
                      px-4
                      py-3
                      text-white
                      outline-none
                      placeholder:text-gray-600
                      focus:border-cyan-400/40
                    "
                  />


                  <div className="
                    mt-4
                    flex
                    gap-3
                  ">

                    <button
                      type="button"
                      onClick={
                        prepareAccountSwitch
                      }
                      className="
                        rounded-xl
                        bg-cyan-400
                        px-5
                        py-2.5
                        text-sm
                        font-bold
                        text-[#020611]
                        transition
                        hover:bg-cyan-300
                      "
                    >
                      Continue
                    </button>


                    <button
                      type="button"
                      onClick={() => {

                        setChangingAccount(
                          false
                        );

                        setNewAccountNumber(
                          ""
                        );

                        setError(
                          ""
                        );
                      }}
                      className="
                        rounded-xl
                        border
                        border-white/10
                        px-5
                        py-2.5
                        text-sm
                        font-semibold
                        text-gray-400
                        transition
                        hover:bg-white/[0.04]
                        hover:text-white
                      "
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>

        )}


        {/* ERROR */}

        {error && (

          <p className="
            mt-5
            text-sm
            text-red-400
          ">
            {error}
          </p>

        )}

      </div>


      {/* ======================================
          CONFIRM SWITCH MODAL
      ====================================== */}

      {confirmSwitchOpen && (

        <div className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-black/70
          p-4
          backdrop-blur-sm
        ">

          <div className="
            relative
            w-full
            max-w-lg
            rounded-3xl
            border
            border-red-400/15
            bg-[#070b13]
            p-7
            shadow-2xl
          ">

            <button
              type="button"
              disabled={
                switching
              }
              onClick={() =>
                setConfirmSwitchOpen(
                  false
                )
              }
              className="
                absolute
                right-5
                top-5
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-xl
                text-gray-500
                transition
                hover:bg-white/[0.05]
                hover:text-white
              "
            >

              <X
                size={18}
              />

            </button>


            <div className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-red-400/10
              text-red-300
            ">

              <AlertTriangle
                size={23}
              />

            </div>


            <h3 className="
              mt-5
              text-xl
              font-bold
              text-white
            ">
              Switch MetaTrader Account?
            </h3>


            <p className="
              mt-3
              leading-7
              text-gray-400
            ">
              You are about to replace
              MetaTrader account{" "}

              <strong className="
                text-white
              ">
                {
                  connection
                    ?.account_number
                }
              </strong>

              {" "}with{" "}

              <strong className="
                text-cyan-300
              ">
                {
                  pendingAccountNumber
                }
              </strong>.
            </p>


            <div className="
              mt-5
              rounded-2xl
              border
              border-red-400/15
              bg-red-400/[0.05]
              p-4
            ">

              <p className="
                text-sm
                font-semibold
                text-red-300
              ">
                Existing Advisor data
                will be permanently removed.
              </p>


              <p className="
                mt-2
                text-xs
                leading-6
                text-red-200/60
              ">
                Raw deals, normalized trades,
                analytics, metrics and sync
                history belonging to the
                previous MetaTrader account
                will be deleted.
              </p>

            </div>


            <p className="
              mt-5
              text-sm
              leading-6
              text-gray-500
            ">
              The new account will receive
              its own stable Advisor key and
              perform one complete historical
              synchronization.
            </p>


            <div className="
              mt-7
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:justify-end
            ">

              <button
                type="button"
                disabled={
                  switching
                }
                onClick={() =>
                  setConfirmSwitchOpen(
                    false
                  )
                }
                className="
                  rounded-xl
                  border
                  border-white/10
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-gray-300
                  transition
                  hover:bg-white/[0.04]
                  disabled:opacity-50
                "
              >
                Cancel
              </button>


              <button
                type="button"
                disabled={
                  switching
                }
                onClick={
                  switchAccount
                }
                className="
                  rounded-xl
                  bg-red-500
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-white
                  transition
                  hover:bg-red-400
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                {
                  switching
                    ? "Switching..."
                    : "Delete Old Data & Switch"
                }

              </button>

            </div>

          </div>

        </div>

      )}

    </>
  );
}


// ==========================================
// INFO ITEM
// ==========================================

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div className="
      rounded-2xl
      border
      border-white/[0.06]
      bg-white/[0.025]
      p-4
    ">

      <p className="
        text-xs
        text-gray-500
      ">
        {label}
      </p>


      <p className="
        mt-2
        font-medium
        text-gray-200
      ">
        {value}
      </p>

    </div>
  );
}