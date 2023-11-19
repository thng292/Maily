import { ConfigContext, MailBoxContext } from "@/data/provider";
import { useContext } from "react";

function App() {
  const [config, setConfig] = useContext(ConfigContext);
  const [mailBox, dispatchMailBox] = useContext(MailBoxContext);
  return (
    <div>
        <p>{JSON.stringify(mailBox)}</p>
      {JSON.stringify(config)}
      <input
        type="text"
        onChange={(e) => {
          setConfig({ ...config, username: e.currentTarget.value });
        }}
      />
    </div>
  );
}

export default App;
