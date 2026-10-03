"""CLI commands for typing (mecanografia) progress tracking.

Usage:
    neirapinuela typing stats
    neirapinuela typing user <username>
    neirapinuela typing history <username>

Or via Flask CLI:
    flask --app neirapinuela typing stats
    flask --app neirapinuela typing user pablo
"""

import click

# Total lessons defined in templates/apps/mecanografia.html (lessonConfig array).
# Update this constant if lessons are added/removed.
TOTAL_LESSONS = 55

ACHIEVEMENT_LABELS = {
    "perfect": "Precisión perfecta (100%)",
    "speed40": "Velocidad (40+ PPM)",
    "persistent": "Aprendiz persistente (5+ lecciones)",
}


def _fmt_dt(dt):
    if dt is None:
        return "-"
    return dt.strftime("%Y-%m-%d %H:%M")


def _fmt_time(seconds):
    if seconds is None:
        return "-"
    s = float(seconds)
    if s < 60:
        return f"{int(s)}s"
    mins = int(s // 60)
    secs = int(s % 60)
    return f"{mins}:{secs:02d}"


@click.group("typing")
def typing_cli():
    """Progreso de mecanografía (backend SQLite)."""


@typing_cli.command("stats")
def stats():
    """Resumen global de todos los usuarios con progreso."""
    from .models import TypingCompletion, TypingAchievement
    from .db import db
    from sqlalchemy import func

    rows = (
        db.session.query(
            TypingCompletion.username,
            func.count(func.distinct(TypingCompletion.lesson_index)).label("lessons"),
            func.max(TypingCompletion.wpm).label("best_wpm"),
        )
        .group_by(TypingCompletion.username)
        .order_by(TypingCompletion.username)
        .all()
    )

    if not rows:
        click.echo("No hay progreso registrado todavía.")
        return

    ach_counts = {}
    for r in (
        TypingAchievement.query.with_entities(
            TypingAchievement.username,
            TypingAchievement.achievement_id,
        )
        .distinct()
        .all()
    ):
        ach_counts.setdefault(r.username, set()).add(r.achievement_id)

    click.echo()
    click.echo(f"{'Usuario':<20} {'Lecciones':<14} {'Mejor PPM':<12} {'Logros':<8}")
    click.echo("-" * 60)
    for r in rows:
        n_ach = len(ach_counts.get(r.username, ()))
        click.echo(
            f"{r.username:<20} {r.lessons}/{TOTAL_LESSONS:<10} "
            f"{r.best_wpm or 0:<12} {n_ach:<8}"
        )
    click.echo()


@typing_cli.command("user")
@click.argument("username")
def user(username):
    """Detalle de un usuario: lecciones completadas y mejores estadísticas."""
    from .models import TypingCompletion, TypingAchievement
    from .db import db
    from sqlalchemy import func

    completions = (
        TypingCompletion.query.filter_by(username=username)
        .order_by(TypingCompletion.lesson_index)
        .all()
    )
    if not completions:
        click.echo(f"El usuario '{username}' no tiene progreso registrado.")
        return

    achievements = (
        TypingAchievement.query.filter_by(username=username)
        .order_by(TypingAchievement.unlocked_at)
        .all()
    )

    # Aggregate best stats per lesson
    best = {}
    for c in completions:
        li = c.lesson_index
        cur = best.get(li)
        if cur is None or c.wpm > cur["best_wpm"]:
            best[li] = {
                "best_wpm": c.wpm,
                "best_accuracy": c.accuracy,
                "min_errors": c.errors,
                "last_at": c.completed_at,
            }
        else:
            # keep best accuracy and min errors independently
            if c.accuracy > best[li]["best_accuracy"]:
                best[li]["best_accuracy"] = c.accuracy
            if c.errors < best[li]["min_errors"]:
                best[li]["min_errors"] = c.errors
            if c.completed_at and (
                not best[li]["last_at"] or c.completed_at > best[li]["last_at"]
            ):
                best[li]["last_at"] = c.completed_at

    click.echo()
    click.echo(f"Usuario: {username}")
    click.echo(f"Lecciones completadas: {len(best)}/{TOTAL_LESSONS}")
    best_wpm = max((c.wpm for c in completions), default=0)
    click.echo(f"Mejor PPM: {best_wpm}")
    if achievements:
        click.echo(
            "Logros: "
            + ", ".join(
                ACHIEVEMENT_LABELS.get(a.achievement_id, a.achievement_id)
                for a in achievements
            )
        )
    else:
        click.echo("Logros: (ninguno)")
    click.echo()
    click.echo(
        f"{'Lección':<10} {'Mejor PPM':<12} {'Precisión':<12} "
        f"{'Errores':<10} {'Última vez':<20}"
    )
    click.echo("-" * 64)
    for li in sorted(best):
        b = best[li]
        click.echo(
            f"#{li:<9} {b['best_wpm']:<12} "
            f"{b['best_accuracy']:.0f}%{'':<8} "
            f"{b['min_errors']:<10} {_fmt_dt(b['last_at']):<20}"
        )
    click.echo()


@typing_cli.command("history")
@click.argument("username")
def history(username):
    """Historial completo cronológico de sesiones de un usuario."""
    from .models import TypingCompletion

    completions = (
        TypingCompletion.query.filter_by(username=username)
        .order_by(TypingCompletion.completed_at)
        .all()
    )
    if not completions:
        click.echo(f"El usuario '{username}' no tiene sesiones registradas.")
        return

    click.echo()
    click.echo(f"Usuario: {username} - Historial de sesiones")
    click.echo()
    click.echo(
        f"{'Fecha':<22} {'Lección':<10} {'PPM':<8} "
        f"{'Precisión':<12} {'Errores':<10} {'Tiempo':<10}"
    )
    click.echo("-" * 72)
    for c in completions:
        click.echo(
            f"{_fmt_dt(c.completed_at):<22} #{c.lesson_index:<9} "
            f"{c.wpm:<8} {c.accuracy:.0f}%{'':<8} "
            f"{c.errors:<10} {_fmt_time(c.time_seconds):<10}"
        )
    click.echo()


def main():
    """Entry point for the `neirapinuela` console script.

    Supports: neirapinuela typing stats | typing user <u> | typing history <u>
    """
    from . import create_app

    app = create_app()

    # Top-level group that contains the "typing" subgroup.
    @click.group()
    def root():
        """neirapinuela CLI."""

    root.add_command(typing_cli, name="typing")

    with app.app_context():
        root()


if __name__ == "__main__":
    main()
