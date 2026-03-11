"""
RAG Service v2 — Client Python async universel
Compatible : FastAPI, Django, scripts standalone, Celery tasks

Usage :
    from rag_client import RagClient, search_nsi
    client = RagClient(tenant="nsi")
    results = await client.search("algorithme de tri", section="education", matiere="nsi")
"""
from __future__ import annotations

import os
from pathlib import Path
from typing import Any, Optional

import httpx


class RagClient:
    """Client async pour le RAG Service v2."""

    def __init__(
        self,
        base_url: str | None = None,
        token: str | None = None,
        tenant: str | None = None,
        timeout: float = 60.0,
    ):
        self.base_url = (
            base_url
            or os.getenv("RAG_API_URL", "http://localhost:8001")
        ).rstrip("/")
        self.token = token or os.getenv("RAG_API_TOKEN", "")
        self.default_tenant = tenant or os.getenv("RAG_DEFAULT_TENANT", "nsi")
        self.timeout = timeout

    @property
    def _headers(self) -> dict[str, str]:
        """Headers communs pour les requêtes JSON."""
        h: dict[str, str] = {"Content-Type": "application/json"}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        return h

    async def health(self) -> dict[str, Any]:
        """Vérifie la santé de l'API."""
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{self.base_url}/health")
            resp.raise_for_status()
            return resp.json()

    async def get_taxonomy(
        self, section: str | None = None
    ) -> dict[str, list[dict[str, Any]]]:
        """Récupère la taxonomie complète."""
        params: dict[str, str] = {}
        if section:
            params["section"] = section
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{self.base_url}/taxonomy",
                headers=self._headers,
                params=params,
            )
            resp.raise_for_status()
            return resp.json()["taxonomy"]

    async def search(
        self,
        query: str,
        *,
        tenant: str | None = None,
        k: int = 5,
        rerank: bool = True,
        alpha: float = 0.7,
        section: str | None = None,
        matiere: str | None = None,
        niveau: str | None = None,
    ) -> dict[str, Any]:
        """Recherche hybride avec filtres taxonomiques."""
        payload: dict[str, Any] = {
            "query": query,
            "tenant": tenant or self.default_tenant,
            "k": k,
            "rerank": rerank,
            "alpha": alpha,
        }
        if section:
            payload["section"] = section
        if matiere:
            payload["matiere"] = matiere
        if niveau:
            payload["niveau"] = niveau

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/search",
                headers=self._headers,
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()

    async def ingest_url(
        self,
        url: str,
        tenant: str | None = None,
        section: str = "general",
        matiere: str | None = None,
        niveau: str | None = None,
        categorie: str | None = None,
        tags: list[str] | None = None,
        auteur: str | None = None,
        annee_scolaire: str | None = None,
        force_reingest: bool = False,
    ) -> dict[str, Any]:
        """Ingestion d'une URL unique."""
        payload: dict[str, Any] = {
            "source": url,
            "source_type": "url",
            "tenant": tenant or self.default_tenant,
            "section": section,
            "force_reingest": force_reingest,
        }
        if matiere:
            payload["matiere"] = matiere
        if niveau:
            payload["niveau"] = niveau
        if categorie:
            payload["categorie"] = categorie
        if tags:
            payload["tags"] = tags
        if auteur:
            payload["auteur"] = auteur
        if annee_scolaire:
            payload["annee_scolaire"] = annee_scolaire

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/ingest",
                headers=self._headers,
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()

    async def ingest_batch(
        self,
        urls: list[str],
        tenant: str | None = None,
        section: str = "general",
        matiere: str | None = None,
        niveau: str | None = None,
        categorie: str | None = None,
        tags: list[str] | None = None,
        force_reingest: bool = False,
    ) -> dict[str, Any]:
        """Ingestion batch d'une liste d'URLs (max 50)."""
        if len(urls) > 50:
            raise ValueError("Maximum 50 URLs par appel batch")

        payload: dict[str, Any] = {
            "urls": urls,
            "tenant": tenant or self.default_tenant,
            "section": section,
            "force_reingest": force_reingest,
        }
        if matiere:
            payload["matiere"] = matiere
        if niveau:
            payload["niveau"] = niveau
        if categorie:
            payload["categorie"] = categorie
        if tags:
            payload["tags"] = tags

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(
                f"{self.base_url}/ingest/batch",
                headers=self._headers,
                json=payload,
            )
            resp.raise_for_status()
            return resp.json()

    async def ingest_file(
        self,
        file_path: str | Path,
        tenant: str | None = None,
        section: str = "general",
        matiere: str | None = None,
        niveau: str | None = None,
        categorie: str | None = None,
        tags: list[str] | None = None,
        auteur: str | None = None,
        annee_scolaire: str | None = None,
        force_reingest: bool = False,
    ) -> dict[str, Any]:
        """Ingestion d'un fichier local via multipart upload."""
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"Fichier non trouvé : {file_path}")

        headers: dict[str, str] = {}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"

        data: dict[str, str] = {
            "tenant": tenant or self.default_tenant,
            "section": section,
            "force_reingest": str(force_reingest).lower(),
        }
        if matiere:
            data["matiere"] = matiere
        if niveau:
            data["niveau"] = niveau
        if categorie:
            data["categorie"] = categorie
        if tags:
            data["tags"] = ",".join(tags)
        if auteur:
            data["auteur"] = auteur
        if annee_scolaire:
            data["annee_scolaire"] = annee_scolaire

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            with path.open("rb") as f:
                resp = await client.post(
                    f"{self.base_url}/ingest/upload",
                    headers=headers,
                    data=data,
                    files={"file": (path.name, f, "application/octet-stream")},
                )
            resp.raise_for_status()
            return resp.json()

    async def get_stats(self, tenant: str | None = None) -> dict[str, Any]:
        """Statistiques d'un tenant."""
        t = tenant or self.default_tenant
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{self.base_url}/stats/{t}",
                headers=self._headers,
            )
            resp.raise_for_status()
            return resp.json()

    async def get_taxonomy_stats(
        self, tenant: str | None = None
    ) -> list[dict[str, Any]]:
        """Statistiques taxonomiques d'un tenant."""
        t = tenant or self.default_tenant
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{self.base_url}/stats/{t}/taxonomy",
                headers=self._headers,
            )
            resp.raise_for_status()
            data = resp.json()
            return data.get("breakdown", [])


# ── Singleton global ─────────────────────────────────────────────────

_client: RagClient | None = None


def get_rag_client() -> RagClient:
    """Retourne le client singleton (thread-safe pour usage FastAPI/DI)."""
    global _client
    if _client is None:
        _client = RagClient()
    return _client


# ── Helpers spécialisés ──────────────────────────────────────────────

async def search_nsi(query: str, niveau: str | None = None) -> dict[str, Any]:
    """Recherche dans les ressources NSI Education."""
    return await get_rag_client().search(
        query,
        tenant="nsi",
        section="education",
        matiere="nsi",
        niveau=niveau,
        k=5,
        rerank=True,
    )


async def search_mfai(query: str) -> dict[str, Any]:
    """Recherche dans les ressources MFAI."""
    return await get_rag_client().search(
        query,
        tenant="mfai",
        section="mfai",
        k=5,
        rerank=True,
    )


async def search_web3(query: str, matiere: str | None = None) -> dict[str, Any]:
    """Recherche dans les ressources Web3."""
    return await get_rag_client().search(
        query,
        tenant="web3",
        section="web3",
        matiere=matiere,
        k=5,
        rerank=True,
    )
