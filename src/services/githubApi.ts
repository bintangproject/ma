import JSZip from 'jszip';

export interface GitHubFilePayload {
  path: string;
  content: string;
}

/**
 * Pushes a single file to a GitHub repository branch via GitHub REST API
 */
export async function pushFileToGitHub(
  owner: string,
  repo: string,
  path: string,
  content: string,
  token: string,
  branch = 'main',
  commitMessage = 'fix: auto sync update from simpres'
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    
    // Check if file already exists to get its SHA
    let existingSha: string | undefined;
    try {
      const getRes = await fetch(`${url}?ref=${branch}`, {
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      });
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        existingSha = fileInfo.sha;
      }
    } catch {
      // ignore
    }

    // Convert string content to base64 UTF-8
    const bytes = new TextEncoder().encode(content);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Content = btoa(binary);

    const bodyData: any = {
      message: commitMessage,
      content: base64Content,
      branch,
    };
    if (existingSha) {
      bodyData.sha = existingSha;
    }

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyData),
    });

    if (!putRes.ok) {
      const errJson = await putRes.json().catch(() => ({}));
      throw new Error(errJson.message || `HTTP ${putRes.status}`);
    }

    return { success: true, message: `Berhasil memperbarui ${path}` };
  } catch (err: any) {
    return { success: false, message: `Gagal memperbarui ${path}: ${err.message}` };
  }
}

/**
 * Downloads a complete ZIP of the critical project files so user can extract and run immediately
 */
export async function downloadProjectZip(fileMap: Record<string, string>, zipName = 'simpres-ma-darul-lughah.zip') {
  const zip = new JSZip();

  for (const [filePath, content] of Object.entries(fileMap)) {
    zip.file(filePath, content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
