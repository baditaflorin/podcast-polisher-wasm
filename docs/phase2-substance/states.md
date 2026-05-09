# Phase 2 State Taxonomy

The workbench has one source file at a time and one active processing job at most.

| State       | Meaning                                                         | Required user exit                                       |
| ----------- | --------------------------------------------------------------- | -------------------------------------------------------- |
| `idle`      | No file is selected.                                            | Choose file or demo audio.                               |
| `analyzing` | A file was selected and preflight is reading bounded metadata.  | Choose another file or wait.                             |
| `ready`     | Preflight completed with no fatal issue.                        | Process, adjust settings, reset, or choose another file. |
| `blocked`   | Preflight found a fatal file issue before FFmpeg starts.        | Choose another file or reset.                            |
| `running`   | FFmpeg worker is loading, measuring, processing, or exporting.  | Cancel.                                                  |
| `done`      | Audio export and metadata are ready.                            | Download, process again, reset, or choose another file.  |
| `error`     | A recoverable processing error occurred after preflight.        | Retry, reset, or choose another file.                    |
| `cancelled` | The user cancelled an active job and the worker was terminated. | Process again, reset, or choose another file.            |

Concurrency rule: a stale preflight or processing result may not overwrite the current file state. Each operation carries a monotonically increasing job id.
