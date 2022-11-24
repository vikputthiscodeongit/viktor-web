<?php include __DIR__ . "/../../components/icon-grid/icon-grid-content.php"; ?>

<ul class="icon-grid" aria-label="<?php echo $SOCIAL_ICON_GRID_LABEL; ?>">
    <li class="icon">
        <a href="<?php echo $INSTAGRAM['profile_url']; ?>" target="_blank" rel="noopener">
            <img class="icon" src="<?php echo $INSTAGRAM['logo_uri']; ?>" alt="<?php echo $INSTAGRAM['stylized_name']; ?>">
        </a>
    </li>

    <li class="icon">
        <a href="<?php echo $LINKEDIN['profile_url']; ?>" target="_blank" rel="noopener">
            <img class="icon" src="<?php echo $LINKEDIN['logo_uri']; ?>" alt="<?php echo $LINKEDIN['stylized_name']; ?>">
        </a>
    </li>

    <li class="icon icon--shift-right">
        <a href="<?php echo $GITHUB['profile_url']; ?>" target="_blank" rel="noopener">
            <img class="icon" src="<?php echo $GITHUB['logo_uri']; ?>" alt="<?php echo $GITHUB['stylized_name']; ?>">
        </a>
    </li>

    <li class="icon">
        <a href="<?php echo $NPM['profile_url']; ?>" target="_blank" rel="noopener">
            <img class="icon" src="<?php echo $NPM['logo_uri']; ?>" alt="<?php echo $NPM['stylized_name']; ?>">
        </a>
    </li>
</ul>
