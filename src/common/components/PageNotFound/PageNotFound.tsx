import styles from "./PageNotFound.module.css"
import Button from "@mui/material/Button"
import { NavLink } from "react-router"

export const PageNotFound = () => (
  <>
    <h1 className={styles.title}>404</h1>
    <h2 className={styles.subtitle}>page not found</h2>
    <Button
      component={NavLink}
      to="/"
      variant={"contained"}
      sx={{
        width: "fit-content",
        textAlign: "center",
        display: "block",
        margin: "20px auto 0",
      }}
    >
      Вернуться на главную
    </Button>
  </>
)
