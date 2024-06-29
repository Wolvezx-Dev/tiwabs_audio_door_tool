import { ActionIcon, Group, Paper, Title } from "@mantine/core";
import { AiFillCloseCircle, AiFillMinusCircle } from "react-icons/ai";

function appQuit() {
  window.Main.sendMessage("appQuit");
}

function appMinimize() {
  window.Main.sendMessage("appMinimize");
}

export function Header() {
  return (
    <Paper
      sx={{
        WebkitAppRegion: "drag",
        width: '100%',
        height: 30,
        backgroundColor: "#333",
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        boxSizing: 'border-box',
      }}
    >
      <Group sx={{ flex: 1, WebkitAppRegion: "no-drag" }}>
        <Title
          sx={{
            fontSize: "14px",
            fontWeight: 500,
            color: "white",
            textAlign: 'center',
            marginLeft: 'auto',
            marginRight: 'auto',
            WebkitAppRegion: "drag",
          }}
        >
          WXMaps - Audio Tool
        </Title>
      </Group>
      <Group sx={{ WebkitAppRegion: "no-drag", marginLeft: 'auto' }} spacing={0}>
        <ActionIcon onClick={appMinimize} sx={{ color: 'white', marginRight: 5 }}>
          <AiFillMinusCircle size={20} />
        </ActionIcon>
        <ActionIcon onClick={appQuit} sx={{ color: 'white' }}>
          <AiFillCloseCircle size={20} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}