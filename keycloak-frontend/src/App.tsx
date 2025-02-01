import ky, { HTTPError } from "ky";
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useSearchParams,
} from "react-router";
import { useAuthStore } from "./store/useAuthStore";
import { useShallow } from "zustand/shallow";

const keycloakUrl =
  "http://113.198.66.77:10213/realms/test/protocol/openid-connect";
const clientId = "front-test";
const redirectUri = "http://localhost:5173/callback";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/movies" element={<Movies />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function Movies() {
  const [accessToken, refreshToken, isAuthenticated] = useAuthStore(
    useShallow((state) => [
      state.accessToken,
      state.refreshToken,
      state.isAuthenticated,
    ])
  );
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMovies() {
      const response = await ky
        .get("http://localhost:3000/movies", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .json();

      console.log(response);
    }

    if (!isAuthenticated) {
      navigate("/");
    }

    fetchMovies();
  }, [isAuthenticated]);

  return <div></div>;
}

function Layout() {
  // useEffect(() => {

  // }, []);

  return (
    <>
      <Outlet />
    </>
  );
}

function Home() {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
  });

  const [accessToken, refreshToken, isAuthenticated] = useAuthStore(
    useShallow((state) => [
      state.accessToken,
      state.refreshToken,
      state.isAuthenticated,
    ])
  );

  return (
    <>
      <div>logged in: {isAuthenticated.toString()}</div>
      {isAuthenticated ? (
        <div>
          <a
            href={`${keycloakUrl}/logout?post_logout_redirect_uri=${"http://localhost:5173"}&client_id=${clientId}`}
          >
            logout
          </a>
        </div>
      ) : (
        <div>
          <a href={`${keycloakUrl}/auth?${params.toString()}`}>login</a>
        </div>
      )}
    </>
  );
}

interface ErrorResponse {
  error: string;
  error_description: string;
}

async function fetchToken(code: string) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
  });

  return ky
    .post(`${keycloakUrl}/token`, {
      body,
    })
    .json<KeycloakTokenResponse>();
}

function Callback() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const [accessToken, refreshToken, setTokens] = useAuthStore(
    useShallow((state) => [
      state.accessToken,
      state.refreshToken,
      state.setTokens,
    ])
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const getToken = async () => {
      if (!code) return;

      try {
        setIsLoading(true);
        const data = await fetchToken(code);
        setTokens(data.access_token, data.refresh_token);
      } catch (err) {
        if (err instanceof HTTPError) {
          const errorData = await err.response.json<ErrorResponse>();
          console.error(errorData);
        }
        setError("토큰 요청 중 네트워크 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
        navigate("/");
      }
    };

    getToken();
  }, [code, setTokens]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <p>code:{code}</p>
      <p>accessToken:{accessToken}</p>
      <p>refreshToken:{refreshToken}</p>
    </>
  );
}

export default App;

export interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  not_before_policy: number;
  session_state: string;
  scope: string;
}
