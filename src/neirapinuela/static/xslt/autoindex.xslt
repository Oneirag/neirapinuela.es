<?xml version="1.0" encoding="UTF-8"?>
<!-- 
    Nginx Autoindex XSLT Template for neirapinuela.es
    Matches the design of base.html and style.css
-->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="html" encoding="UTF-8" indent="yes" />

    <xsl:template match="/">
        <xsl:text disable-output-escaping="yes">&lt;!DOCTYPE html&gt;</xsl:text>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Index of neirapinuela.es</title>
            
            <!-- External CSS -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" />
            
            <!-- 
                 Internal CSS mimicking style.css 
                 Using <style> instead of <link> to ensure it works regardless of VHost path setup,
                 though <link href="/static/css/style.css" ...> would also be an option.
            -->
            <style>
                :root {
                    --primary-color: #198754;
                    --primary-dark: #146c43;
                    --text-color: #000000;
                    --background-color: #ffffff;
                    --border-color: #dee2e6;
                }

                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: var(--text-color);
                    background-color: var(--background-color);
                }

                .navbar {
                    background-color: #000000 !important;
                    border-bottom: 2px solid var(--primary-color);
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }

                .navbar-brand {
                    font-weight: 600;
                    color: var(--primary-color) !important;
                    font-size: 1.5rem;
                    text-decoration: none;
                }

                .footer {
                    background-color: #f8f9fa;
                    border-top: 1px solid var(--border-color);
                    margin-top: auto;
                    padding: 2rem 0;
                }

                .text-primary { color: var(--primary-color) !important; }

                .autoindex-container {
                    margin-top: 3rem;
                    margin-bottom: 3rem;
                }

                .table th {
                    border-top: none;
                    text-transform: uppercase;
                    font-size: 0.8rem;
                    letter-spacing: 0.05rem;
                    color: #6c757d;
                }

                .file-icon {
                    margin-right: 10px;
                    display: inline-block;
                    width: 20px;
                    text-align: center;
                }

                .card {
                    border: 1px solid var(--border-color);
                    border-radius: 0.5rem;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                a {
                    color: var(--primary-color);
                    text-decoration: none;
                }

                a:hover {
                    color: var(--primary-dark);
                    text-decoration: underline;
                }
            </style>
        </head>
        <body class="d-flex flex-column min-vh-100">
            <nav class="navbar navbar-expand-lg">
                <div class="container">
                    <a class="navbar-brand" href="/">neirapinuela.es</a>
                </div>
            </nav>

            <main class="flex-grow-1">
                <div class="container autoindex-container">
                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb">
                            <li class="breadcrumb-item"><a href="/">Home</a></li>
                            <li class="breadcrumb-item active" aria-current="page">File Browser</li>
                        </ol>
                    </nav>

                    <h1 class="mb-4 fw-bold">Index of Directory</h1>
                    
                    <div class="card">
                        <div class="card-body p-0">
                            <div class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead>
                                        <tr>
                                            <th class="ps-4">Name</th>
                                            <th>Last Modified</th>
                                            <th class="text-end pe-4">Size</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <!-- Parent Directory link -->
                                        <tr>
                                            <td class="ps-4" colspan="3">
                                                <a href="../">
                                                    <span class="file-icon">⤴️</span> .. (Parent Directory)
                                                </a>
                                            </td>
                                        </tr>
                                        <xsl:apply-templates select="list/directory" />
                                        <xsl:apply-templates select="list/file" />
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer class="footer">
                <div class="container">
                    <div class="row">
                        <div class="col-md-6">
                            <p class="mb-0">&#169; 2024 neirapinuela.es</p>
                        </div>
                        <div class="col-md-6 text-md-end">
                            <p class="mb-0">Made with ❤️ by the Neira Pinuela family</p>
                        </div>
                    </div>
                </div>
            </footer>

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    </xsl:template>

    <!-- Template for directories -->
    <xsl:template match="directory">
        <tr>
            <td class="ps-4">
                <a href="{.}/">
                    <span class="file-icon">📁</span>
                    <xsl:value-of select="." />
                </a>
            </td>
            <td>
                <xsl:value-of select="substring(@mtime, 1, 10)" />
                <xsl:text> </xsl:text>
                <xsl:value-of select="substring(@mtime, 12, 8)" />
            </td>
            <td class="text-end pe-4">-</td>
        </tr>
    </xsl:template>

    <!-- Template for files -->
    <xsl:template match="file">
        <tr>
            <td class="ps-4">
                <a href="{.}">
                    <span class="file-icon">📄</span>
                    <xsl:value-of select="." />
                </a>
            </td>
            <td>
                <xsl:value-of select="substring(@mtime, 1, 10)" />
                <xsl:text> </xsl:text>
                <xsl:value-of select="substring(@mtime, 12, 8)" />
            </td>
            <td class="text-end pe-4">
                <xsl:choose>
                    <xsl:when test="@size &lt; 1024">
                        <xsl:value-of select="@size" /> B
                    </xsl:when>
                    <xsl:when test="@size &lt; 1048576">
                        <xsl:value-of select="format-number(@size div 1024, '0.0')" /> KB
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="format-number(@size div 1048576, '0.0')" /> MB
                    </xsl:otherwise>
                </xsl:choose>
            </td>
        </tr>
    </xsl:template>
</xsl:stylesheet>
